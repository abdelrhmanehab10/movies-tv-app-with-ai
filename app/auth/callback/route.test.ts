import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);

function getRedirect(response: Response) {
  const location = response.headers.get("location");

  expect(location).not.toBeNull();
  return new URL(location!);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns to the home page after a successful code exchange", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);

    const response = await GET(
      new Request("https://cinemotion.test/auth/callback?code=valid-code")
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("valid-code");
    expect(getRedirect(response).href).toBe("https://cinemotion.test/");
  });

  it("redirects a callback without a code to a useful login error", async () => {
    const response = await GET(
      new Request("https://cinemotion.test/auth/callback")
    );
    const redirect = getRedirect(response);

    expect(createClientMock).not.toHaveBeenCalled();
    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("error")).toBe("missing_code");
  });

  it.each(["invalid authorization code", "authorization code has expired"])(
    "preserves an error state when Supabase reports %s",
    async (message) => {
      const exchangeCodeForSession = vi
        .fn()
        .mockResolvedValue({ error: { message } });
      createClientMock.mockResolvedValue({
        auth: { exchangeCodeForSession },
      } as never);

      const response = await GET(
        new Request("https://cinemotion.test/auth/callback?code=bad-code")
      );
      const redirect = getRedirect(response);

      expect(redirect.pathname).toBe("/login");
      expect(redirect.searchParams.get("error")).toBe(
        "invalid_or_expired_code"
      );
      expect(redirect.search).toBe("?error=invalid_or_expired_code");
    }
  );

  it("handles a provider callback error without exposing its message", async () => {
    const response = await GET(
      new Request(
        "https://cinemotion.test/auth/callback?error=access_denied&error_description=Sensitive%20provider%20details"
      )
    );
    const redirect = getRedirect(response);

    expect(createClientMock).not.toHaveBeenCalled();
    expect(redirect.pathname).toBe("/login");
    expect(redirect.search).toBe("?error=invalid_or_expired_code");
  });

  it("preserves an error state when the exchange throws", async () => {
    const exchangeCodeForSession = vi
      .fn()
      .mockRejectedValue(new Error("network unavailable"));
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);

    const response = await GET(
      new Request("https://cinemotion.test/auth/callback?code=bad-code")
    );
    const redirect = getRedirect(response);

    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("error")).toBe("callback_failed");
  });
});
