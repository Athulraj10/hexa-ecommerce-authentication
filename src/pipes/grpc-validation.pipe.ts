// // src/pipes/grpc-validation.pipe.ts
// import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
// import { validate } from 'class-validator';
// import { plainToInstance } from 'class-transformer';
// import { RpcException } from '@nestjs/microservices';
// import { status as GrpcStatus } from '@grpc/grpc-js';

// @Injectable()
// export class GrpcValidationPipe implements PipeTransform<any> {
//   async transform(value: any, { metatype }: ArgumentMetadata) {
//     if (!metatype || !this.toValidate(metatype)) {
//       return value;
//     }
    
//     const object = plainToInstance(metatype, value);
//     const errors = await validate(object);
    
//     if (errors.length > 0) {
//       throw new RpcException({
//         code: GrpcStatus.INVALID_ARGUMENT,
//         message: 'Validation failed',
//         details: errors.map(error => ({
//           field: error.property,
//           constraints: error.constraints,
//         })),
//       });
//     }
    
//     return value;
//   }

//   private toValidate(metatype: Function): boolean {
//     const types: Function[] = [String, Boolean, Number, Array, Object];
//     return !types.includes(metatype);
//   }
// }import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class GrpcValidationInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToRpc().getContext();
    const data = context.switchToRpc().getData();
    const targetType = ctx.handler?.parameters?.[0]?.metatype;

    if (!targetType) {
      return next.handle();
    }

    const object = plainToInstance(targetType, data);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'Validation failed',
        details: errors.map(error => ({
          field: error.property,
          constraints: error.constraints,
        })),
      });
    }

    return next.handle();
  }
}
