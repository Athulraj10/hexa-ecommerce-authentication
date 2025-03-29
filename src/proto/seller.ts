// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v3.21.12
// source: seller.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "seller";

/**
 * message DeleteProductResponse {
 *   bool success = 1;
 *   string message = 2;
 * }
 */

export interface AddProductRequest {
  name: string;
  description: string;
  price: number;
  token: string;
}

export interface AddProductResponse {
  id: string;
  name: string;
  status: number;
  error: string[];
}

export const SELLER_PACKAGE_NAME = "seller";

export interface SellerServiceClient {
  addProduct(request: AddProductRequest): Observable<AddProductResponse>;
}

export interface SellerServiceController {
  addProduct(
    request: AddProductRequest,
  ): Promise<AddProductResponse> | Observable<AddProductResponse> | AddProductResponse;
}

export function SellerServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["addProduct"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("SellerService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("SellerService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const SELLER_SERVICE_NAME = "SellerService";
