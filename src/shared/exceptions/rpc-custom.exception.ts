// src/shared/exceptions/rpc-custom.exception.ts
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

export class RpcCustomException extends RpcException {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly details?: Record<string, any>,
  ) {
    super({ code, message, details: JSON.stringify(details || {}) });
  }

  static notFound(message: string, details?: Record<string, any>) {
    return new RpcCustomException(GrpcStatus.NOT_FOUND, message, details);
  }

  static invalidArgument(message: string, details?: Record<string, any>) {
    // console.log({"GrpcStatus.INVALID_ARGUMENT":GrpcStatus, message, details})
    console.log({ message, details})
    return new RpcCustomException(GrpcStatus.INVALID_ARGUMENT, message, details);
  }

  static unauthorized(message: string, details?: Record<string, any>) {
    return new RpcCustomException(GrpcStatus.UNAUTHENTICATED, message, details);
  }

  static unauthenticated(message: string) {
    return new RpcCustomException(GrpcStatus.UNAUTHENTICATED, message);
  }

  static permissionDenied(message: string) {
    return new RpcCustomException(GrpcStatus.PERMISSION_DENIED, message);
  }


  static internalError(message: string) {
    return new RpcCustomException(GrpcStatus.INTERNAL, message);
  }

}