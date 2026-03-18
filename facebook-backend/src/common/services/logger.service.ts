import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ErrorResponse } from 'src/utils/responses';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  log(message: string) {
    super.log(message);
  }

  error(err: ErrorResponse) {
    const logObject = err;

    // Log the error in object format
    super.error(JSON.stringify(logObject, null, 2));
  }

  warn(message: string) {
    super.warn(message); // Override warning
  }

  debug(message: string) {
    super.debug(message); // Override debug
  }

  verbose(message: string) {
    super.verbose(message); // Override verbose
  }
}
