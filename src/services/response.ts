import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  /**
   * Success response with data for RabbitMQ & HTTP responses
   */
  successResponse(data: any, message = 'Success', extras?: Record<string, any>) {
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data,
      meta: {
        code: 200,
        message,
        ...extras, // Add any extra metadata if provided
      },
    };
    return response;
  }

  /**
   * Success response without data
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
   * Error response with data
   */
  errorResponseData(message: string, code = 400, errors?: any) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
        errors,
      },
    };
  }

  /**
   * Error response without data
   */
  errorResponseWithoutData(message: string, code = 400) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
      },
    };
  }

  /**
   * Validation error response
   */
  validationErrorResponseData(errors: any[], message = 'Validation failed', code = 422) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      meta: {
        code,
        message,
        errors,
      },
    };
  }
}
