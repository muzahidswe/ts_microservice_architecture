import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refreshtoken',
) {
    userLoginType: string;

    constructor(
        private userService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: jwtConstants.secret,
            passReqToCallback: true,
        });
    }

    async validate(req, payload: any) {
        var user = await this.userService.validateRefreshToken(
            payload.id,
            req.headers.refreshtoken
        );
        if (!user) {
            throw new UnauthorizedException();
        }
        if (req.headers.refreshtoken != (await user).refreshtoken) {
            throw new UnauthorizedException();
        }
        if (new Date() > new Date((await user).refreshtokenexpires)) {
            throw new UnauthorizedException('Refresh token expired. Login required.');
        }
        return {
            id: payload.id, userTypeId: payload.userTypeId, companyId: payload.companyId,
            userRoleId: payload.userRoleId, name: payload.name, phone: payload.phone, email: payload.email
        };
    }
}
