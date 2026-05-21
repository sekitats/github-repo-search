import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from '../SearchForm';

const { mockPush, mockQuery } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockQuery: { q: null as string | null },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: vi.fn().mockImplementation(() =>
    new URLSearchParams(mockQuery.q ? { q: mockQuery.q } : undefined)
  ),
}));

describe('SearchForm', () => {

  const setupWrapper = () => {
    const user = userEvent.setup();
    const wrapper = render(<SearchForm />);
    return { user, wrapper };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.q = null;
  });

  it('初期レンダリング時、入力がない場合は検索ボタンが無効化されていること', () => {
    setupWrapper();

    const searchButton = screen.getByRole('button', { name: '検索' });
    expect(searchButton).toBeDisabled();

    const clearButton = screen.queryByRole('button', { name: 'クリア' });
    expect(clearButton).toBeNull();
  });

  it('文字を入力すると検索ボタンが有効になり、クリアボタンが表示されること', async () => {
    const { user } = setupWrapper();

    const input = screen.getByPlaceholderText('リポジトリを検索');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(input, 'react');

    expect(searchButton).not.toBeDisabled();

    const clearButton = screen.getByRole('button', { name: 'クリア' });
    expect(clearButton).toBeVisible();
  });

  it('クリアボタンを押すと検索欄がクリアされ、検索ボタンが有効になり、トップページに遷移すること', async () => {
    const { user } = setupWrapper();

    const input = screen.getByPlaceholderText('リポジトリを検索');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(input, 'react');

    expect(searchButton).not.toBeDisabled();

    const clearButton = screen.getByRole('button', { name: 'クリア' });
    expect(clearButton).toBeVisible();

    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(searchButton).toBeDisabled();
    expect(clearButton).not.toBeVisible();

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('検索ボタンを押すと正しいURLで画面遷移(router.push)が呼ばれること', async () => {
    const { user } = setupWrapper();

    const input = screen.getByPlaceholderText('リポジトリを検索');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(input, 'react');
    await user.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith('/?q=react');
  });

  it('Enterキーを押すと検索が実行されること', async () => {
    const { user } = setupWrapper();

    const input = screen.getByPlaceholderText('リポジトリを検索');

    await user.type(input, 'react');
    await user.keyboard('{Enter}');

    expect(mockPush).toHaveBeenCalledWith('/?q=react');
  })

  it('初期値(URLクエリ)がある場合、最初から入力欄に値が入りボタンが有効なこと', async () => {
    mockQuery.q = 'next.js';

    const { user } = setupWrapper();

    const input = screen.getByPlaceholderText('リポジトリを検索');
    expect(input).toHaveValue('next.js');
    const searchButton = screen.getByRole('button', { name: '検索' });
    expect(searchButton).not.toBeDisabled();

    await user.clear(input);
    await user.type(input, 'react');
    await user.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith('/?q=react');
  })
});
