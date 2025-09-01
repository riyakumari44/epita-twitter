import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

/**
 * the catch decorator binds the required metadatta to the exception filter
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof UnauthorizedException) {
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message || 'Unauthorized';
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.message;
        } else if (exception instanceof QueryFailedError) {
            status = HttpStatus.CONFLICT;
            message = this.handleQueryError(exception);
        } else if (exception instanceof EntityNotFoundError) {
            status = HttpStatus.NOT_FOUND;
            message = 'Entity not found';
        }

        response.status(status).json({
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            payload: null
        });
    }

    private handleQueryError(error: QueryFailedError): string {
        if (error.message.includes('duplicate key')) {
            if (error.message.includes('UQ_Email')) {
                return 'Email already exists';
            }
            if (error.message.includes('UQ_Username')) {
                return 'Username already exists';
            }
        }
        return 'Database error occurred';
    }
}