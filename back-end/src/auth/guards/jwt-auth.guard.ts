import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredException, TokenMissingException, InvalidTokenException } from '../exceptions/auth.exceptions';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            throw new TokenMissingException();
        }
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (info instanceof TokenExpiredError) {
            throw new TokenExpiredException();
        }

        if (info instanceof JsonWebTokenError) {
            throw new InvalidTokenException();
        }

        if (!user && !info) {
            throw new TokenMissingException();
        }

        if (err || !user) {
            throw new InvalidTokenException();
        }

        return user;
    }
}
