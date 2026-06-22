export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export function Type<T>(): T {
  return {} as T;
}

export interface PaginatedResponse<TItem> {
  count: number;
  results: TItem[];
}

export interface UpsertRequest<TCreate, TUpdate> {
  datapoints: (TCreate | (TUpdate & { id: string }))[];
}

type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type QueryParams = Record<string, QueryParamValue>;
