import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  import { status } from '@grpc/grpc-js';
  
  @Injectable()
  export class GrpcErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError(error => {
          // Convert to gRPC-friendly error format
          const grpcError = {
            code: error.code || status.INTERNAL,
            message: error.message || 'Internal server error',
            errors: error.errors || [],
            timestamp: new Date().toISOString(),
          };
          return throwError(() => grpcError);
        })
      );
    }
  }