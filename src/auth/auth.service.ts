import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { RefreshToken } from 'src/database/entities/refreshToken.entity';
import { UserRole } from 'src/services/Enums.role';

interface NewUser {
  name: string;
  email: string;
  password: string;
  phoneNo: string;
  role?: UserRole;
}

@Injectable()
export class UserDatabaseService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async checkEmailExists(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const userExist = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
    console.log(userExist);
    return userExist;
  }
  async checkUserIdExists(userId: string): Promise<boolean | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .getOne();
    return !!user;
  }
  async findByUserId(
    userId: string,
  ): Promise<{ id: string; role: string } | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id AS "userId"', 'user.role AS "role"'])
      .where('user.id = :userId', { userId })
      .getRawOne();

    return user ? user : null;
  }
  async getUserDetails(
    userId: string,
  ): Promise<{ id: string; role: string; password: string } | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id AS "userId"',
        'user.role AS "role"',
        'user.password AS "password"',
      ])
      .where('user.id = :userId', { userId })
      .getRawOne();

    return user ? user : null;
  }

  async checkRefreshTokenToUser(refreshTokenObject: {
    refreshToken: string;
    userId: string;
  }): Promise<any> {
    const { refreshToken, userId } = refreshTokenObject;

    const userExist = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!userExist) {
      return null;
    }

    await this.refreshTokenRepository.delete({ userId });

    const newToken = this.refreshTokenRepository.create({
      refreshToken,
      userId,
    });
    return await this.refreshTokenRepository.save(newToken);
  }

  async checkRefreshExist(refreshTokenObject: {
    refreshToken: string;
  }): Promise<RefreshToken | null> {
    const { refreshToken } = refreshTokenObject;

    const tokenExist = await this.refreshTokenRepository.findOne({
      where: { refreshToken: refreshToken },
    });
    return tokenExist;
  }
  async deleteRefreshToken(refreshTokenObject: {
    refreshToken: string;
  }): Promise<DeleteResult> {
    const { refreshToken } = refreshTokenObject;

    const deleteResult = await this.refreshTokenRepository.delete({
      refreshToken: refreshToken,
    });

    return deleteResult;
  }
  async deleteRefreshTokenByUserId(userId: string): Promise<{
    deleteResult: DeleteResult;
    deletedData: RefreshToken[];
  }> {
    const deletedData = await this.refreshTokenRepository.find({
      where: { userId },
    });

    const deleteResult = await this.refreshTokenRepository.delete({
      userId,
    });

    return { deleteResult, deletedData };
  }

  async createNewUser(data: NewUser): Promise<User> {
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions:data.role
    });
    return await this.userRepository.save(user);
  }

  /**
   * Updates a user's specific field based on key-value pair.
   * @param userId - The ID of the user to update
   * @param key - The column name to update
   * @param value - The new value for the column
   * @returns Updated user object
   */
  async updateUserField(
    userId: string,
    key: keyof User,
    value: any,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    (user as any)[key] = value;
    return this.userRepository.save(user);
  }

  //   async saveRefreshToken(userId: string, token: string): Promise<RefreshToken> {
  //     if (!token) throw new Error('Refresh token is required!');

  //     const user = await this.userRepository.findOne({ where: { id: userId } });
  //     if (!user) throw new Error('User not found');

  //     const refreshTokenSaved = this.refreshTokenRepository.create({
  //       refreshToken: token,
  //       user,
  //     });
  //     return await this.refreshTokenRepository.save(refreshTokenSaved);
  //   }
}
