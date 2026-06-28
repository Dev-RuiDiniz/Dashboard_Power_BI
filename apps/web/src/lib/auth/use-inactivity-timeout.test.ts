import { act, renderHook } from '@testing-library/react';

import { useInactivityTimeout } from './use-inactivity-timeout';

const mockLogout = jest.fn().mockResolvedValue({ success: true });
const mockGetAuthSession = jest.fn();
const mockClearAuthSession = jest.fn();

jest.mock('./api', () => ({
  logout: (...args: unknown[]) => mockLogout(...args),
}));

jest.mock('./session', () => ({
  getAuthSession: () => mockGetAuthSession(),
  clearAuthSession: () => mockClearAuthSession(),
}));

describe('useInactivityTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGetAuthSession.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('deve fazer logout automático após o timeout', async () => {
    const onTimeout = jest.fn();

    renderHook(() => useInactivityTimeout(onTimeout, 1000));

    await act(async () => {
      jest.advanceTimersByTime(1100);
      await Promise.resolve();
    });

    expect(mockLogout).toHaveBeenCalledWith('refresh', 'access');
    expect(mockClearAuthSession).toHaveBeenCalled();
    expect(onTimeout).toHaveBeenCalled();
  });

  it('deve resetar o timer ao detectar atividade do usuário', async () => {
    const onTimeout = jest.fn();

    renderHook(() => useInactivityTimeout(onTimeout, 1000));

    act(() => {
      jest.advanceTimersByTime(500);
      window.dispatchEvent(new Event('mousedown'));
      jest.advanceTimersByTime(500);
    });

    expect(mockLogout).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('não deve iniciar timer se não houver sessão', () => {
    mockGetAuthSession.mockReturnValue(null);

    renderHook(() => useInactivityTimeout(jest.fn(), 1000));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockLogout).not.toHaveBeenCalled();
  });
});
