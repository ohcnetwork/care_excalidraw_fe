import {
  apiRoutes,
  HttpMethod,
  PaginatedResponse,
  Type,
} from "@/lib/http-request";
import {
  MetaArtifactCreateRequest,
  MetaArtifactRead,
  MetaArtifactUpdateRequest,
} from "@/types/meta-artifact";

export const metaArtifactApis = apiRoutes({
  create: {
    path: "/api/v1/meta_artifacts/",
    method: HttpMethod.POST,
    TResponse: Type<MetaArtifactRead>(),
    TRequest: Type<MetaArtifactCreateRequest>(),
  },
  retrieve: {
    path: "/api/v1/meta_artifacts/{external_id}/",
    method: HttpMethod.GET,
    TResponse: Type<MetaArtifactRead>(),
  },
  list: {
    path: "/api/v1/meta_artifacts/",
    method: HttpMethod.GET,
    TResponse: Type<PaginatedResponse<MetaArtifactRead>>(),
  },
  update: {
    path: "/api/v1/meta_artifacts/{external_id}/",
    method: HttpMethod.PUT,
    TRequest: Type<MetaArtifactUpdateRequest>(),
    TResponse: Type<MetaArtifactRead>(),
  },
});
