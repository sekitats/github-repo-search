import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepoPagination } from '../RepoPagination';
import type { Props as RepoPaginationProps } from "../RepoPagination"

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('RepoPagination', () => {
  const mockPush = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
  } as any);

  const mockSearchParams = (value: string | null) => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(value),
    } as any);
  }
  mockSearchParams(null);

  const setupWrapper = (props: RepoPaginationProps) => {
    const user = userEvent.setup();
    const wrapper = render(<RepoPagination {...props} />);
    return { user, wrapper };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1ページ目の時は Previous がdisabledになること', () => {
    const { wrapper } = setupWrapper({ q: 'next.js', page: 1, totalPages: 10 });

    const prevButton = wrapper.getByLabelText('Go to previous page');

    expect(prevButton).not.toHaveAttribute('href');
    expect(prevButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('最終ページの時は Next がdisabledになること', () => {
    const { wrapper } = setupWrapper({ q: 'next.js', page: 10, totalPages: 10 });

    const nextButton = wrapper.getByLabelText('Go to next page');

    expect(nextButton).not.toHaveAttribute('href');
    expect(nextButton).toHaveAttribute('aria-disabled', 'true');
  });
})