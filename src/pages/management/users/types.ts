export type SortDirection = "asc" | "desc";

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  type: string;
  address?: string;
  status?: string;
  gender?: string;
  age?: number | string;
  secondaryEmails?: string[];
  createdAt: string;
  updatedAt: string;
}
