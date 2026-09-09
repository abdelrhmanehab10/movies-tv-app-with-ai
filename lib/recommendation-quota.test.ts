import { describe, expect, it, vi } from "vitest";

import {
  FreeLimitReachedError,
  runWithQuota,
  type QuotaClaim,
} from "./recommendation-quota";

class AtomicMemoryQuota {
  used = 0;

  constructor(private readonly limit: number) {}

  async claim(): Promise<QuotaClaim> {
    if (this.used >= this.limit) {
      return { allowed: false, remaining: 0 };
    }

    this.used += 1;
    return { allowed: true, remaining: this.limit - this.used };
  }

  async release() {
    this.used = Math.max(this.used - 1, 0);
  }
}

describe("runWithQuota", () => {
  it("allows only three simultaneous recommendation requests", async () => {
    const quota = new AtomicMemoryQuota(3);
    const provider = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { id: 42 };
    });

    const requests = Array.from({ length: 8 }, () =>
      runWithQuota({
        claim: () => quota.claim(),
        release: () => quota.release(),
        recommend: provider,
      })
    );
    const results = await Promise.allSettled(requests);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      3
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      5
    );
    expect(
      results
        .filter((result) => result.status === "rejected")
        .every((result) => result.reason instanceof FreeLimitReachedError)
    ).toBe(true);
    expect(provider).toHaveBeenCalledTimes(3);
    expect(quota.used).toBe(3);
  });

  it("refunds a pick when a provider fails", async () => {
    const quota = new AtomicMemoryQuota(3);
    const providerError = new Error("provider unavailable");
    const release = vi.spyOn(quota, "release");

    await expect(
      runWithQuota({
        claim: () => quota.claim(),
        release: () => quota.release(),
        recommend: async () => {
          throw providerError;
        },
      })
    ).rejects.toBe(providerError);

    expect(release).toHaveBeenCalledOnce();
    expect(quota.used).toBe(0);
  });

  it("keeps the provider error when logging a refund failure", async () => {
    const providerError = new Error("provider unavailable");
    const releaseError = new Error("database unavailable");
    const onReleaseError = vi.fn();

    await expect(
      runWithQuota({
        claim: async () => ({ allowed: true, remaining: 2 }),
        release: async () => {
          throw releaseError;
        },
        recommend: async () => {
          throw providerError;
        },
        onReleaseError,
      })
    ).rejects.toBe(providerError);

    expect(onReleaseError).toHaveBeenCalledWith(releaseError);
  });
});
