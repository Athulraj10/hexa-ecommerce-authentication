import {
  Controller,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { RabbitMQMessagePatterns } from 'src/rabbitMQ/RabbitMQ_message_pattern';
import { SignupDto } from './dto/signup.dto';
import { lastValueFrom, timeout } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { ResponseService } from 'src/services/response';
import { JwtService } from 'src/services/jwt.service';
import { UUIDService } from 'src/services/uuid.service';
import { RefreshTokenDto } from './dto/refresh.dto';
import { CONSTANTS } from 'src/services/Constants';
import { UserDatabaseService } from './auth.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller()
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly centerilizedDatabase: ClientProxy,
    private readonly responseService: ResponseService,
    private readonly jwtService: JwtService,
    private readonly userDatabaseService: UserDatabaseService,
  ) {}
  private readonly logger = new Logger(AuthController.name);

  @MessagePattern(RabbitMQMessagePatterns.SIGNUP)
  async handleSignup(@Payload() credentials: SignupDto) {
    try {
      if (
        credentials?.email &&
        credentials?.name &&
        credentials?.password &&
        credentials?.phoneNo &&
        credentials?.role
      ) {
        const isEmailExist = await this.userDatabaseService.checkEmailExists(
          credentials.email,
        );
        // THROW ERROR IF EXISIT
        if (isEmailExist) {
          return this.responseService.errorResponseData(
            CONSTANTS.RESPONSE_MESSAGE.EMAIL_ALREADY_USED,
          );
        }

        if (!isEmailExist) {
          const passwordWithoutHash = credentials?.password;
          if (passwordWithoutHash) {
            const hashedPassword = await bcrypt.hash(passwordWithoutHash, 10);
            credentials.password = hashedPassword;

            const createNewUser =
              await this.userDatabaseService.createNewUser(credentials);

            const accessTokenPayload = {
              email: credentials.email,
              role: credentials.role,
              userId: createNewUser.id,
            };
            const refreshTokenPayload = {
              email: credentials.email,
              role: credentials.role,
              userId: createNewUser.id,
            };
            console.log({ createNewUser });
            const userTokens = {
              accessToken:
                await this.jwtService.generateAccessToken(accessTokenPayload),
              refreshToken:
                await this.jwtService.generateRefreshToken(refreshTokenPayload),
            };

            const userTokenPayload = {
              userId: createNewUser.id,
              refreshToken: userTokens.refreshToken,
            };

            this.userDatabaseService.checkRefreshTokenToUser(userTokenPayload);

            const { password, ...userDataWithoutPassword } = createNewUser;
            return this.responseService.successResponse(
              {
                newUser: userDataWithoutPassword,
                accessToken: userTokens?.accessToken,
                refreshToken: userTokens?.refreshToken,
              },
              CONSTANTS.RESPONSE_MESSAGE.NEW_USER_CREATED,
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
      return this.responseService.errorResponseWithoutData(error);
    }
  }

  @MessagePattern(RabbitMQMessagePatterns.LOGIN)
  async handleAuthLogin(@Payload() data: LoginDto) {
    try {
      if (data?.email && data?.password) {
        const payload = {
          email: data?.email,
          password: data?.password,
        };
        const currentUser = await this.userDatabaseService.checkEmailExists(
          payload.email,
        );

        console.log({ currentUser });
        if (!currentUser) {
          return this.responseService.errorResponseData(
            CONSTANTS.RESPONSE_MESSAGE.EMAIL_NOT_FOUND,
          );
        }

        if (currentUser) {
          const passwordWithoutHash = payload?.password;
          if (passwordWithoutHash) {
            const hashedPassword = await bcrypt.compare(
              passwordWithoutHash,
              currentUser.password,
            );

            if (!hashedPassword) {
              return this.responseService.errorResponseData(
                CONSTANTS.RESPONSE_MESSAGE.EMAIL_OR_PASSWORD_INCORRECT,
              );
            }

            const accessTokenPayload = {
              email: currentUser.email,
              role: currentUser.role,
              userId: currentUser.id,
            };
            const refreshTokenPayload = {
              email: currentUser.email,
              role: currentUser.role,
              userId: currentUser.id,
            };

            const userTokens = {
              accessToken:
                await this.jwtService.generateAccessToken(accessTokenPayload),
              refreshToken:
                await this.jwtService.generateRefreshToken(refreshTokenPayload),
            };
            console.log({ userTokens });
            const userTokenPayload = {
              userId: currentUser.id,
              refreshToken: userTokens.refreshToken,
            };
            const saveTokenToDatabase =
              await this.userDatabaseService.checkRefreshTokenToUser(
                userTokenPayload,
              );

            console.log({ saveTokenToDatabase });

            const { password, ...userDataWithoutPassword } = currentUser;
            return this.responseService.successResponse(
              {
                newUser: userDataWithoutPassword,
                accessToken: userTokens?.accessToken,
                refreshToken: userTokens?.refreshToken,
              },
              'Login successful',
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in auth_login: ', error.message, error.stack);
    }
  }

  @MessagePattern(RabbitMQMessagePatterns.REFRESH_TOKEN)
  async handleAuthRefresh(@Payload() data: RefreshTokenDto) {
    try {
      if (data) {
        const { refreshToken } = data;

        if (refreshToken && refreshToken !== undefined) {
          const tokenPayload = refreshToken;
          if (!tokenPayload) {
            return this.responseService.errorResponseData(
              CONSTANTS.RESPONSE_MESSAGE.TOKEN_EXPIRED,
            );
          }
          const payload = {
            refreshToken: tokenPayload,
          };
          console.log({ payload });
          if (payload?.refreshToken) {
            const tokenPayload =
              await this.jwtService.verifyAccessToken(refreshToken);
            const refreshTokenExists =
              await this.userDatabaseService.checkRefreshExist(payload);
            if (!refreshTokenExists) {
              return this.responseService.errorResponseData(
                CONSTANTS.RESPONSE_MESSAGE.TOKEN_EXPIRED,
              );
            }
            if (refreshTokenExists) {
              const deleteRefreshToken = {
                refreshToken: refreshTokenExists?.refreshToken,
              };
              await this.userDatabaseService.deleteRefreshToken(
                deleteRefreshToken,
              );
            }

            if (tokenPayload?.data?.userId !== refreshTokenExists?.userId) {
              return this.responseService.errorResponseData(
                CONSTANTS.RESPONSE_MESSAGE.INVALID_TOKEN,
              );
            }
            const newToken = {
              accessToken:
                await this.jwtService.generateAccessToken(tokenPayload),
              refreshToken:
                await this.jwtService.generateRefreshToken(tokenPayload),
            };

            if (newToken && newToken !== null) {
              const newTokenObject = {
                refreshToken: newToken?.refreshToken,
                userId: tokenPayload?.data?.userId,
              };
              const saveNewToken =
                await this.userDatabaseService.checkRefreshTokenToUser(
                  newTokenObject,
                );
              if (saveNewToken) {
                return newToken;
              } else {
                return this.responseService.errorResponseData(
                  CONSTANTS.RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
                );
              }
            }
          }
        }
      }
      // const isEmailExist$ = this.centerilizedDatabase.send(
      //   RabbitMQMessagePatterns.DATABASE_QUERY.DATABASE_EMAIL_EXIST,
      //   { email: credentials.email, phoneNo: credentials?.phoneNo },
      // );
      // const isEmailExist = await lastValueFrom(isEmailExist$.pipe(timeout(5000)));

      // return this.responseService.successResponse(refreshToken);
    } catch (error) {
      console.error(error);
      return this.responseService.errorResponseWithoutData(error);
    }
  }

  @MessagePattern(RabbitMQMessagePatterns.RESET_PASSWORD)
  async handleResetPassword(@Payload() data: ResetPasswordDto) {
    try {
      if (data) {
        const { password, oldPassword } = data;
        const { role, userId } = data.authUser;

        if (
          password &&
          password !== undefined &&
          oldPassword &&
          oldPassword !== undefined
        ) {
          const tokenPayload = {
            password,
            oldPassword,
          };
          if (!oldPassword || !password) {
            const errorMessage = !oldPassword
              ? 'oldPassword is required'
              : !password
                ? 'password is required'
                : 'Both oldPassword and password are required';
            return this.responseService.errorResponseData(errorMessage);
          }
          if (oldPassword === password) {
            return this.responseService.errorResponseData(
              CONSTANTS.RESPONSE_MESSAGE.MUST_PROVIDE_NEW_PASSWORD,
            );
          }

          const currentUser =
            await this.userDatabaseService.getUserDetails(userId);
          console.log({ currentUser });
          if (!currentUser) {
            return this.responseService.errorResponseData(
              CONSTANTS.RESPONSE_MESSAGE.USER_NOT_FOUND,
            );
          }
          console.log({
            'currentUser.password': currentUser.password,
            oldPassword,
          });
          const verifyPassword = await bcrypt.compare(
            oldPassword,
            currentUser.password,
          );
          console.log({ verifyPassword });
          if (!verifyPassword) {
            return this.responseService.errorResponseData(
              CONSTANTS.RESPONSE_MESSAGE.OLD_PASSWORD_INVALID,
            );
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          if (verifyPassword) {
            const updateUserPassword =
              await this.userDatabaseService.updateUserField(
                userId,
                'password',
                hashedPassword,
              );
            if (updateUserPassword && updateUserPassword !== null) {
              return this.responseService.successResponseWithoutData(
                CONSTANTS.RESPONSE_MESSAGE.PASSWORD_RESET_SUCCESSFUL,
              );
            } else {
              return this.responseService.errorResponseData(
                CONSTANTS.RESPONSE_MESSAGE.INVALID_TOKEN,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      return this.responseService.errorResponseWithoutData(error);
    }
  }

  @MessagePattern(RabbitMQMessagePatterns.LOGOUT)
  async logoutUser(@Payload() data: any) {
    try {
      if (data && data?.userId) {
        const { userId } = data;

        if (userId) {
          const response =
            await this.userDatabaseService.deleteRefreshTokenByUserId(userId);
          console.log({ response });
          return response;
        }
      } else {
        return this.responseService.errorResponseWithoutData(
          'userId required',
          401,
        );
      }
    } catch (error) {
      console.error(error);
      return this.responseService.errorResponseWithoutData(error);
    }
  }

  @MessagePattern(RabbitMQMessagePatterns.VALIDATE_USER)
  async validateUser(
    @Payload() data: { email: string; role: string; userId: string },
  ) {
    try {
      if (data && data?.userId) {
        const { userId } = data;

        if (userId) {
          const response = await this.userDatabaseService.findByUserId(userId);
          return response;
        }
      } else {
        return this.responseService.errorResponseWithoutData(
          'userId required',
          401,
        );
      }
    } catch (error) {
      console.error(error);
      return this.responseService.errorResponseWithoutData(error);
    }
  }
}
