import { Observable } from 'rxjs';
import { AuthSuccess, ErrorResponse } from 'src/proto/auth';

export interface AuthServiceClient {
  login(request: LoginRequest): Observable<AuthResponse>;
  // ... other methods
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success?: AuthSuccess;
  error?: ErrorResponse;
}

// ... other interfaces