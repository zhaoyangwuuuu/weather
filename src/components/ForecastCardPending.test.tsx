// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ForecastCardPending } from "./ForecastCardPending";

const { mockUseLinkStatus } = vi.hoisted(() => ({
  mockUseLinkStatus: vi.fn(() => ({ pending: false })),
}));

vi.mock("next/link", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/link")>()),
  useLinkStatus: mockUseLinkStatus,
}));

describe("ForecastCardPending", () => {
  it("renders spinner with opacity-0 when not pending", () => {
    mockUseLinkStatus.mockReturnValue({ pending: false });
    const { container } = render(<ForecastCardPending />);
    const spinner = container.querySelector(".loading")!;
    expect(spinner).toHaveClass("opacity-0");
  });

  it("renders spinner with opacity-100 when pending", () => {
    mockUseLinkStatus.mockReturnValue({ pending: true });
    const { container } = render(<ForecastCardPending />);
    const spinner = container.querySelector(".loading")!;
    expect(spinner).toHaveClass("opacity-100");
  });
});
