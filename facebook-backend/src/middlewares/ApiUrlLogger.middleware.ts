import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from 'src/common/services';

@Injectable()
export class APIUrlLoggerMiddleware implements NestMiddleware {
  private logger = new CustomLogger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`API Hit: ${req.method} ${req.url}`);
    next();
  }
}
