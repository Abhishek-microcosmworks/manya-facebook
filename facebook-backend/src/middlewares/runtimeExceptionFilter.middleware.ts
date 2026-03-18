import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomLogger } from 'src/common/services';
import { ErrorResponse } from 'src/utils/responses';
import { MulterError } from 'multer'; // Import MulterError

@Catch()
export class RuntimeExceptionFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = new ErrorResponse();
    errorResponse.timestamp = new Date();
    errorResponse.path = request.url;

    // Handle MulterError
    if (
      exception instanceof BadRequestException &&
      exception.message === 'Unexpected field'
    ) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Unexpected file field found.';
      this.logger.error(errorResponse);
    } else if (exception instanceof MulterError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = this.handleMulterError(exception); // Custom Multer error message
      this.logger.error(errorResponse);
    } else if (exception instanceof HttpException) {
      // Handle standard HttpException
      const responseError = exception.getResponse();
      const status = exception.getStatus();

      errorResponse.statusCode = status;

      if (
        typeof responseError === 'object' &&
        responseError.hasOwnProperty('message')
      ) {
        if (Array.isArray(responseError['message'])) {
          // Extract the first validation error message
          const firstErrorMessage = responseError['message'][0];
          errorResponse.message = firstErrorMessage;
        } else {
          errorResponse.message = responseError['message'];
        }
      } else {
        errorResponse.message = exception.message || 'Bad Request';
      }

      this.logger.error(errorResponse);
    } else if (exception instanceof Error) {
      const error = exception as any;

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const firstErrorField = Object.keys(error.errors)[0];
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = `${firstErrorField} is required`;
      }
      // Handle MongoDB duplicate key errors
      else if (error.name === 'MongoServerError' && error.code === 11000) {
        errorResponse.statusCode = HttpStatus.CONFLICT;
        const match = error.message.match(/dup key: { (.+?) }/);
        const uniqueField = match ? match[1].split(':')[0].trim() : 'field';
        errorResponse.message = `${uniqueField} must be unique.`;
      }
      // Handle other MongoDB errors
      else if (error.name === 'MongoError') {
        errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse.message = `MongoDB Error: ${error.message || ''}`;
      } else if (
        error.message.includes('RelationIdLoader') ||
        error.stack?.includes('RelationIdLoader')
      ) {
        errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse.message =
          error.message || 'Database relation loading error';
      } else {
        errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse.message = `An Unexpected error occurred | ${error.message || ''}`;
      }

      this.logger.error(errorResponse);
    } else {
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse.message = 'An unexpected error occurred!';

      this.logger.error(errorResponse);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  // Custom handler for MulterError
  private handleMulterError(exception: MulterError): string {
    switch (exception.message) {
      case 'Unexpected field':
        return 'Custom error message: Unexpected file field detected.';
      case 'File too large':
        return 'Custom error message: The uploaded file is too large.';
      default:
        return `Multer error: ${exception.message}`;
    }
  }
}
