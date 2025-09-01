import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Define the response structure
export interface Response<T> {
    statusCode: number;
    message: string;
    timestamp: string;
    payload: T | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map(data => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                const baseResponse = {
                    statusCode,
                    timestamp: new Date().toISOString(),
                };

                return statusCode >= 400
                    ? {
                        ...baseResponse,
                        message: data.message || 'Error',
                        payload: null
                    }
                    : {
                        ...baseResponse,
                        message: 'Success',
                        payload: data || null
                    };
            })
        );
    }

}
