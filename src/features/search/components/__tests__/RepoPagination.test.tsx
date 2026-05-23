import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepoPagination } from "../RepoPagination";
import type { Props as RepoPaginationProps } from "../RepoPagination";

const { mockPush, mockQuery } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockQuery: { q: null as string | null },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: vi
    .fn()
    .mockImplementation(
      () => new URLSearchParams(mockQuery.q ? { q: mockQuery.q } : undefined),
    ),
}));

describe("RepoPagination", () => {
  const setupWrapper = (props: RepoPaginationProps) => {
    const user = userEvent.setup();
    const wrapper = render(<RepoPagination {...props} />);
    return { user, wrapper };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.q = null;
  });

  it("1ページ目の時は Previous がdisabledになること", () => {
    const { wrapper } = setupWrapper({ q: "next.js", page: 1, totalPages: 10 });

    const prevButton = wrapper.getByLabelText("Go to previous page");

    expect(prevButton).not.toHaveAttribute("href");
    expect(prevButton).toHaveAttribute("aria-disabled", "true");
  });

  it("最終ページの時は Next がdisabledになること", () => {
    mockQuery.q = "next.js";
    const { wrapper } = setupWrapper({
      q: "next.js",
      page: 10,
      totalPages: 10,
    });

    const nextButton = wrapper.getByLabelText("Go to next page");

    expect(nextButton).not.toHaveAttribute("href");
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
  });
});
