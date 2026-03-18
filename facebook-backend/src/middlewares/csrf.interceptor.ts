import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Attach CSRF token to response headers if it exists
    if (request.csrfToken) {
      const csrfToken = request.csrfToken();
      response.setHeader('X-CSRF-Token', csrfToken);
    }

    return next.handle();
  }
}
