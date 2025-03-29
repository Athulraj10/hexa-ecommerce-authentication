import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { RabbitMQMessagePatterns } from 'src/rabbitMQ/RabbitMQ_message_pattern';
import { GrpcMethod } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { JwtService } from 'src/services/jwt.service';
import { ResponseService } from 'src/services/response';
import { UserDatabaseService } from './auth.service';
import { CONSTANTS } from 'src/services/Constants';
import { Controller, Logger } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { AuthResponse, LoginRequest } from 'src/proto/auth';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly jwtService: JwtService,
    private readonly userDatabaseService: UserDatabaseService,
  ) {}

  @GrpcMethod('AuthService', 'Signup')
  async handleSignup(@Payload() credentials: SignupDto) {
    console.log({ credentials });
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

  @GrpcMethod('AuthService', 'Login')
  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const timestamp = new Date().toISOString();
    
    try {
      // Validate input
      if (!loginRequest.email || !loginRequest.password) {
        return {
          error: {
            code: status.INVALID_ARGUMENT,
            message: 'Validation failed',
            errors: [{
              field: !loginRequest.email ? 'email' : 'password',
              message: 'This field is required',
              code: 'REQUIRED_FIELD'
            }],
            timestamp
          }
        };
      }
  
      // Business logic
      const user = await this.userService.validateUser(
        loginRequest.email, 
        loginRequest.password
      );
  
      if (!user) {
        return {
          error: {
            code: status.UNAUTHENTICATED,
            message: 'Authentication failed',
            errors: [{
              field: 'credentials',
              message: 'Invalid email or password',
              code: 'INVALID_CREDENTIALS'
            }],
            timestamp
          }
        };
      }
  
      // Generate tokens
      const tokens = await this.tokenService.generateTokens(user);
  
      return {
        success: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      };
  
    } catch (error) {
      return {
        error: {
          code: status.INTERNAL,
          message: 'Internal server error',
          errors: [{
            field: 'system',
            message: 'An unexpected error occurred',
            code: 'SERVER_ERROR'
          }],
          timestamp,
          ...(process.env.NODE_ENV === 'development' && { 
            details: error.message 
          })
        }
      };
    }
  }

  @GrpcMethod('AuthService', 'RefreshToken')
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

  @GrpcMethod('AuthService', 'ResetPassword')
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

  @GrpcMethod('AuthService', 'Logout')
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
