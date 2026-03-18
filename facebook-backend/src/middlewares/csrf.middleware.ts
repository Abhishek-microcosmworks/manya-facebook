import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection;

  constructor() {
    this.csrfProtection = csurf({ cookie: true }); // CSRF protection with cookies
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.csrfProtection(req, res, (err) => {
      if (err) {
        if (err.code === 'EBADCSRFTOKEN') {
          throw new UnauthorizedException('Invalid or missing CSRF token.');
        }
        throw err; // Pass other errors along
      }
      next();
    });
  }
}
