const configuredImageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL?.trim();
const imageBaseUrl =
  configuredImageBaseUrl && /^https?:\/\//.test(configuredImageBaseUrl)
    ? configuredImageBaseUrl.replace(/\/$/, "")
    : "https://image.tmdb.org/t/p/w500";

export function getTmdbImageUrl(path?: string | null): string {
  if (!path) return "/logo.png";

  return `${imageBaseUrl}/${path.replace(/^\//, "")}`;
}
