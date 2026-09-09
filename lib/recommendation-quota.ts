export interface QuotaClaim {
  allowed: boolean;
  remaining: number;
}

interface QuotaRun<T> {
  claim: () => Promise<QuotaClaim>;
  release: () => Promise<unknown>;
  recommend: () => Promise<T>;
  onReleaseError?: (error: unknown) => void;
}

export class FreeLimitReachedError extends Error {
  readonly code = "FREE_LIMIT_REACHED";
  readonly remaining = 0;

  constructor() {
    super("You have used all 3 free AI picks.");
    this.name = "FreeLimitReachedError";
  }
}

export async function runWithQuota<T>({
  claim,
  release,
  recommend,
  onReleaseError,
}: QuotaRun<T>) {
  const quota = await claim();

  if (!quota.allowed) {
    throw new FreeLimitReachedError();
  }

  try {
    const result = await recommend();
    return { result, remaining: quota.remaining };
  } catch (error) {
    try {
      await release();
    } catch (releaseError) {
      onReleaseError?.(releaseError);
    }

    throw error;
  }
}
