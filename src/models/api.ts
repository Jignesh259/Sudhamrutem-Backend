export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
