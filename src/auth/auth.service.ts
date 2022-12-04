import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
var randtoken = require('rand-token');

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(user: any) {
        let payload: object;
        payload = {
            name: user.name, id: user.id, userTypeId: user.user_type_id,
            phone: user.phone, email: user.email, sbu_id: user.sbu_id
        };
        const userInfo = {...user};
        delete userInfo.id;
        return {
            message: 'success',
            success:true,
            data: {
                accessToken: this.jwtService.sign(payload),
                refreshToken: await this.generateRefreshToken(user.id),
                ...userInfo
            },
        };
    }

    async generateNewAccessTokenCheckingRefreshToken(request: any) {
        let refreshToken = request.headers.refreshtoken;
        let user = request.user;
        //Here the user object added inside the request from jwt.refreshtoken.strategy.ts file & validate function.
        //Guard is execute before the function 
        let payload: object;
        payload = {
            name: user.name, id: user.id, sbu_id:user.sbu_id, userTypeId: user.userTypeId,
            userRoleId: user.user_role_id, phone: user.phone, email: user.email
        };
        return {
            message: 'success',
            data: {
                accessToken: this.jwtService.sign(payload),
                refreshToken: refreshToken,
                data: {}
            },
        };
    }

    async generateRefreshToken(userId): Promise<string> {
        var refreshToken = randtoken.generate(16);
        var expirydate = new Date();
        expirydate.setDate(
            expirydate.getDate() + jwtConstants.refreshTokenexpirationDate,
        );
        await this.userService.saveRefreshToken(
            refreshToken,
            userId,
            expirydate,
        );
        return refreshToken;
    }

    verifyJwt(jwt: string) {
        try {
            return this.jwtService.verify(jwt);
        } catch (error) {
            throw new UnauthorizedException('JWT verification failed');
        }
    }

    async checkRefreshToken(id: string, refreshToken: string) {
        const result = await this.userService.checkRefreshToken(id, refreshToken);
        return result;
    }

    async logOut(req: any): Promise<any> {
        const result = await this.userService.logOut(req);
        return result;
    }
}
