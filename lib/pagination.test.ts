import { describe, expect, it } from "vitest";

import { createPaginatedUrl } from "./pagination";

describe("createPaginatedUrl", () => {
  it("keeps search parameters and adds one page parameter", () => {
    const pageTwoUrl = createPaginatedUrl(
      "/api/tmdb/search?query=alien&type=movie",
      2,
      "https://cinemotion.test"
    );
    const url = new URL(pageTwoUrl);

    expect(url.searchParams.get("query")).toBe("alien");
    expect(url.searchParams.get("type")).toBe("movie");
    expect(url.searchParams.getAll("page")).toEqual(["2"]);
    expect(pageTwoUrl.match(/\?/g)).toHaveLength(1);
  });
});
