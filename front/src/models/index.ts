export * from "@/models/auth.interface";
export * from "@/models/background.interface";
export * from "@/models/character.interface";
export * from "@/models/collection.interface";
export * from "@/models/message.interface";
export * from "@/models/user.interface";

export interface IResponse {
  statusCode: number;
  body: string;
}

export interface IBaseEntity {
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Pageable<T> {
  pageable: {
    totalPages: number;
    pageSize: number;
    page: number;
    totalElements: number;
  };
  content: T[];
}
