# Free AI model options for Cinemotion

Research date: 2026-09-06

## Context

Cinemotion sends three short preference values—mood, story type, and setting—to an AI model. The model only needs to return one movie or series title; TMDB then resolves that title into artwork and metadata. This is a small text-generation workload, so a large reasoning model is unnecessary.

## Shortlist

| Option | Cost model | Fit for Cinemotion | Integration effort | Main caveat |
| --- | --- | --- | --- | --- |
| **Groq + `openai/gpt-oss-20b`** | Free-plan quotas | **Best drop-in option**; fast text generation and enough capability for a short recommendation prompt | Very low; the existing OpenAI SDK can use Groq's OpenAI-compatible base URL | Free quotas are shared at the organization level and can be exhausted |
| **Google Gemini 3.1 Flash-Lite** | Free input and output tokens on the free tier | **Best hosted free-tier option**; Google describes it as cost-efficient and suited to simple data processing | Low; Gemini exposes an OpenAI-compatible endpoint, or the official Google SDK can be used | Free-tier content may be used to improve Google's products; limits vary by model/project |
| **OpenRouter free router** | Free models with low limits | Good for experimentation and trying different models behind one API | Very low; it implements the OpenAI chat-completions format | Model selection and availability can change; official docs say free models are usually not suitable for production |
| **Ollama + a local model** | No provider API charge | Best for private local development or a self-hosted deployment | Medium; requires installing Ollama, downloading a model, and keeping a local service running | The machine pays the compute cost; it is not a simple fit for a public Vercel deployment |
| **Cloudflare Workers AI** | 10,000 Neurons/day on the Workers Free plan | Viable if the app moves its AI route to Cloudflare | Medium; requires Cloudflare account/bindings or REST integration | Adds platform coupling, and some models require paid billing |
| **Hugging Face Inference Providers** | Free users currently receive $0.10/month in credits | Useful for testing many providers, but too small for a dependable app feature | Medium | The free allowance is explicitly subject to change and extra usage requires purchased credits |

## Findings

### 1. Groq is the best first implementation for this repository

Groq documents an OpenAI-compatible API at `https://api.groq.com/openai/v1`, so the current `openai` package can remain in place and only the API key, base URL, and model need to change. Groq currently lists `openai/gpt-oss-20b` as a compact open-weight text model, and its free-plan table lists 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute, and 200,000 tokens/day for that model. These limits are more than enough for one short recommendation request at a time, but they are not an unlimited production guarantee.

Sources: [Groq OpenAI compatibility](https://console.groq.com/docs/openai), [Groq rate limits](https://console.groq.com/docs/rate-limits), and [GPT-OSS 20B model page](https://console.groq.com/docs/model/openai/gpt-oss-20b).

Suggested server configuration:

```ts
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

model: "openai/gpt-oss-20b"
```

### 2. Gemini is the strongest alternative

Google's current pricing page lists free input and output tokens for Gemini 3.1 Flash-Lite and describes it as optimized for high-volume agentic tasks, translation, and simple data processing. Google's free tier is available through Google AI Studio, but the page states that free-tier content is used to improve Google's products. Google also documents OpenAI-library compatibility, so the existing SDK can be reused with a Gemini base URL if desired.

Sources: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai), and [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

### 3. OpenRouter is flexible but less predictable

OpenRouter provides an `openrouter/free` router that automatically selects an available free model, and it supports the OpenAI API format. Its official documentation warns that free models have low rate limits and are generally intended for experimentation rather than production. This makes it a useful fallback or playground, but not the primary provider for a public recommendation button.

Sources: [OpenRouter free models](https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground), [OpenRouter FAQ](https://openrouter.ai/docs/faq), and [OpenRouter quickstart](https://openrouter.ai/docs/quickstart).

### 4. Ollama is genuinely free, but local

Ollama exposes an OpenAI-compatible local endpoint at `http://localhost:11434/v1/` and requires the model to be downloaded locally first. It removes API quotas and keeps prompts on the machine, but the app host must supply enough CPU/RAM/GPU and keep Ollama running. That makes it excellent for local development, private use, or a server we control—not for a normal serverless deployment without additional infrastructure.

Source: [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility).

### 5. Cloudflare and Hugging Face are secondary choices

Cloudflare Workers AI includes a 10,000-Neuron daily free allocation and a catalog of hosted models, but adopting it would add Cloudflare-specific deployment work. Hugging Face's current free-user allowance is $0.10/month and is subject to change, so it is better for short experiments than for a user-facing feature.

Sources: [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Cloudflare model catalog](https://developers.cloudflare.com/workers-ai/models/), and [Hugging Face Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing).

## Recommendation

Use **Groq with `openai/gpt-oss-20b`** first:

1. It preserves the existing OpenAI SDK and chat-completions code.
2. It has a current free-plan quota suitable for this low-volume feature.
3. It is designed for fast text inference, which matters more than deep reasoning here.
4. It avoids adding a second SDK while the rest of the app is stabilized.

Use **Gemini 3.1 Flash-Lite** if the priority is the most generous-looking hosted free tier or if Groq's quota/availability is not sufficient. Use **Ollama** only when zero provider cost and local privacy matter more than easy public deployment.

## Implementation notes

- Keep the provider key server-side in `app/api/recommend/route.ts`.
- Ask the model for only a clean title, with no explanation, so the TMDB search query stays precise.
- Limit output tokens and validate the returned title before calling TMDB.
- Add basic rate limiting or caching because the route is publicly callable.
- Treat free-tier quotas, model IDs, and policies as changeable; re-check the provider docs before deployment.
