export interface ApiSuccessResponse<T = any> {
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
    details?: any;
  };
  timestamp: string;
  path: string;
}
