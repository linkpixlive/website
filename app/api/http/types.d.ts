export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: number;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}
