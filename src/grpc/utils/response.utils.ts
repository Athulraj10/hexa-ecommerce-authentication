import { status } from '@grpc/grpc-js';
import { Metadata } from '@grpc/grpc-js';

export class GrpcResponse {
  static success<T>(data: T) {
    return { success: data };
  }

  static error(code: number, message: string, errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>, metadata?: Metadata) {
    const error = {
      code,
      message,
      errors: errors || [],
      timestamp: new Date().toISOString(),
    };

    if (metadata) {
      const meta = new Metadata();
      Object.entries(metadata).forEach(([key, value]) => {
        meta.add(key, value);
      });
      throw { code, message: JSON.stringify(error), metadata: meta };
    }

    return { error };
  }

  static validationError(errors: Array<{
    field: string;
    message: string;
    code: string;
  }>) {
    return this.error(
      status.INVALID_ARGUMENT,
      'Validation failed',
      errors
    );
  }
}