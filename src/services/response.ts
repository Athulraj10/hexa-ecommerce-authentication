import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ResponseService {
  /**
   * Success response for gRPC
   */
  successResponse(data: any, message = 'Success', extras?: Record<string, any>) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      data,
      meta: {
        code: 200,
        message,
        ...extras, // Add any extra metadata if provided
      },
    };
  }


  /**
   * Success response without data for gRPC
   */
  successResponseWithoutData(message: string, code = 200) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
      },
    };
  }

  /**
   * Error response with data for gRPC
   * Throws an RpcException to be handled on the client side
   */
  errorResponseData(message: string, code = 400, errors?: any) {
    throw new RpcException({
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
        errors,
      },
    });
  }

  /**
   * Error response without data for gRPC
   * Throws an RpcException to be handled on the client side
   */
  errorResponseWithoutData(message: string, code = 400) {
    throw new RpcException({
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
      },
    });
  }

  /**
   * Validation error response for gRPC
   * Throws an RpcException to be handled on the client side
   */
  validationErrorResponseData(errors: any[], message = 'Validation failed', code = 422) {
    throw new RpcException({
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
        errors,
      },
    });
  }
}
