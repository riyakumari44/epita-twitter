import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  // why is context not being used ?
  // because we are not modifying anything in the excetion context (request)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('start of timeout interceptor');
    return next.handle().pipe(
      timeout(3000),
      catchError((err) => {
        console.log('error in timeout interceptor');
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err as unknown);
      }),
    );
  }
}