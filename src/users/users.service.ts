import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenLogRepository } from 'src/database_table/repository/token-log.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(TokenLogRepository)
    private readonly tokenLogRepository: TokenLogRepository,
  ) {}

  async validateRefreshToken(userId: string, refreshToken: string) {
    const res = await this.tokenLogRepository.findOne({
        where:[
            {
                refreshtoken:refreshToken,
                user_id:userId,
                user_type:39
            }
        ]
    });
    if (res) {
        return res;
    } else {
        return false;
    }
  }

async saveRefreshToken(refreshToken, userId, expirydate) {
  await this.tokenLogRepository.insert({
      user_id: userId,
      refreshtoken: refreshToken,
      refreshtokenexpires: expirydate,
      user_type:39,
  });
}

async checkRefreshToken(userId: string, refreshToken: string): Promise<any> {
  const isRefreshTokenAvailable= await this.tokenLogRepository.find({
      where:[
          {
              refreshtoken:refreshToken,
              user_id:userId,
          }
      ]
  });

    if (isRefreshTokenAvailable.length > 0) {
        return true;
    } else {
        return false;
    }
  }

  async logOut(req): Promise<any> {

    try {
        const res = true;
        if (res) {
            return {
                error: false,
                message: 'Logged out successfully',
            };
        } else {
            return {
                error: true,
                message: 'Log out failed',
            };
        }
    } catch (e) {
        throw new InternalServerErrorException(e.message);
    }
}

}
