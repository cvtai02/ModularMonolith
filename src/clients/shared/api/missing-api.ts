import type { GetAllQuery, GetAllResponse } from "./content-types";

export type MediaFileListParams = GetAllQuery;
export type MediaFilePaginatedList = GetAllResponse;
export type MediaFileResponse = GetAllResponse["items"][number];
