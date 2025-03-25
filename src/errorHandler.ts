// import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
// import { RpcException } from '@nestjs/microservices';

// @Catch()
// export class RpcExceptionFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const context = host.switchToRpc();
//     const response = context.getResponse();

//     // Customize your error response here
//     const errorResponse = {
//       statusCode: 400,
//       message: exception.message || 'An error occurred',
//     };

//     throw new RpcException(errorResponse); // Throw the RpcException with the error response
//   }
// }
