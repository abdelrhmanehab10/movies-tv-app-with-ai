export const createPaginatedUrl = (
  link: string,
  page: number,
  origin: string
) => {
  const url = new URL(link, origin);
  url.searchParams.set("page", String(page));

  return url.toString();
};
