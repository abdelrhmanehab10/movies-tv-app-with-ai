import type { AxiosRequestConfig } from "axios";

export function getTmdbAuthConfig(credential?: string): AxiosRequestConfig {
  if (!credential) return {};

  // TMDB v3 keys are 32-character values; v4 read tokens use Bearer auth.
  const isV3ApiKey = /^[A-Za-z0-9]{32}$/.test(credential);

  if (isV3ApiKey) {
    return { params: { api_key: credential } };
  }

  return {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${credential}`,
    },
  };
}
