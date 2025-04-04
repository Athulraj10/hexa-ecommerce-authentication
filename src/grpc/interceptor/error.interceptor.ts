// src/grpc/interceptor/error.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { ValidationError } from 'class-validator';
import { RpcCustomException } from 'src/shared/exceptions/rpc-custom.exception';

@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Already properly formatted RpcException
        if (error instanceof RpcException) {
          return throwError(() => error);
        }

        // Handle validation errors
        if (Array.isArray(error) && error[0] instanceof ValidationError) {
          return throwError(() => 
            new RpcCustomException(
              GrpcStatus.INVALID_ARGUMENT,
              'Validation failed',
              this.formatValidationErrors(error)
            )
          );
        }

        // Handle HTTP-style errors
        if (error.status) {
          const grpcCode = this.mapHttpToGrpcCode(error.status);
          return throwError(() => 
            new RpcCustomException(
              grpcCode,
              error.message || 'Error occurred',
              error.response?.message || error.details
            )
          );
        }

        // Fallback to internal server error
        return throwError(() => 
          new RpcCustomException(
            GrpcStatus.INTERNAL,
            error.message || 'Internal Server Error',
            { stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined }
          )
        );
      }),
    );
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formatted = {};
    errors.forEach(error => {
      if (error.constraints) {
        formatted[error.property] = Object.values(error.constraints);
      }
    });
    return formatted;
  }

  private mapHttpToGrpcCode(httpStatus: number): number {
    const mapping = {
      400: GrpcStatus.INVALID_ARGUMENT,
      401: GrpcStatus.UNAUTHENTICATED,
      403: GrpcStatus.PERMISSION_DENIED,
      404: GrpcStatus.NOT_FOUND,
      409: GrpcStatus.ALREADY_EXISTS,
      429: GrpcStatus.RESOURCE_EXHAUSTED,
      500: GrpcStatus.INTERNAL,
      501: GrpcStatus.UNIMPLEMENTED,
      503: GrpcStatus.UNAVAILABLE,
    };
    return mapping[httpStatus] ?? GrpcStatus.UNKNOWN;
  }
}