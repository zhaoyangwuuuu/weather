import { vi } from "vitest";

interface MockResponseInit {
  status?: number;
  statusText?: string;
  body?: unknown;
}

export function makeMockFetch(init: MockResponseInit = {}) {
  const { status = 200, statusText = "OK", body = {} } = init;
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json:
      body === null
        ? vi.fn().mockRejectedValue(new SyntaxError("Unexpected end of JSON"))
        : vi.fn().mockResolvedValue(body),
  } as unknown as Response);
}

export function makeMockFetchNetworkError(message = "Network request failed") {
  return vi.fn().mockRejectedValue(new Error(message));
}

export function makeMockFetchAbortError() {
  const err = new Error("The operation was aborted");
  err.name = "AbortError";
  return vi.fn().mockRejectedValue(err);
}
