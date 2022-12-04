import {
    BadRequestException,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { GlobalService } from 'src/utils/global.service';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
    constructor(private authService: AuthService) { }

    async use(req: Request, res: Response, next: NextFunction) {

        let rerfereshToken: string;
        let tokenArray: string[];

        if (req.headers.refreshtoken) {
            rerfereshToken = String(req.headers.refreshtoken);
        } else {
            throw new BadRequestException('Refresh token required');
        }

        if (req.headers['authorization']) {
            tokenArray = req.headers['authorization'].split(' ');
        } else {
            throw new BadRequestException('JWT token required');
        }

        const decodedToken = this.authService.verifyJwt(tokenArray[1]);

        let result = await this.authService.checkRefreshToken(
            decodedToken.id,
            rerfereshToken,
        );

        if (result) {
            GlobalService.userId = decodedToken.id;
            GlobalService.sbu_id = decodedToken.sbu_id;
            GlobalService.userTypeId = decodedToken.userTypeId;
            GlobalService.userRoleId = decodedToken.userRoleId;
            next();
        } else {
            throw new BadRequestException('Invalid refresh token');
        }
    }
}




