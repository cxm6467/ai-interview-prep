import { renderHook, act } from '@testing-library/react';
import { useAutoScrollToBottom } from './useScrollFix';

// Mock DOM methods
const createMockElement = (scrollTop = 0, scrollHeight = 1000, clientHeight = 500) => ({
  scrollTop,
  scrollHeight,
  clientHeight,
  scrollTo: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

describe('useAutoScrollToBottom Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize and provide functions', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([]));

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.unseenCount).toBe(0);
    expect(result.current.isNearBottom).toBe(true);
    expect(typeof result.current.scrollToBottom).toBe('function');
  });

  it('should handle message changes', () => {
    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScrollToBottom(messages),
      { initialProps: { messages: ['msg1'] } }
    );

    expect(result.current.unseenCount).toBe(0);

    rerender({ messages: ['msg1', 'msg2'] });
    expect(result.current.unseenCount).toBe(0);
  });

  it('should call scrollToBottom function', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([]));

    act(() => {
      result.current.scrollToBottom();
    });

    expect(result.current.unseenCount).toBe(0);
  });

  it('should handle enabled/disabled states', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([], false));
    expect(result.current.unseenCount).toBe(0);

    const { result: result2 } = renderHook(() => useAutoScrollToBottom([], true));
    expect(result2.current.unseenCount).toBe(0);
  });

  it('should handle custom threshold', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([], true, 50));
    expect(result.current.unseenCount).toBe(0);
  });

  it('should handle shouldCountMessage function', () => {
    const messages = [{ type: 'user' }, { type: 'bot' }];
    const shouldCount = (msg: any) => msg.type === 'bot';
    
    const { result } = renderHook(() => useAutoScrollToBottom(messages, true, 100, shouldCount));
    expect(result.current.unseenCount).toBe(0);
  });

  it('should handle container ref attachment', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([]));
    const mockElement = createMockElement(0, 1000, 500);

    act(() => {
      // @ts-expect-error - Testing ref attachment
      result.current.containerRef.current = mockElement;
    });

    expect(result.current.containerRef.current).toBe(mockElement);
  });

  it('should handle scroll position changes with container', () => {
    const { result } = renderHook(() => useAutoScrollToBottom([]));
    const mockElement = createMockElement(400, 1000, 500); // Near bottom

    act(() => {
      // @ts-expect-error - mock element assignment for testing
      result.current.containerRef.current = mockElement;
    });

    // Trigger scroll event simulation
    act(() => {
      result.current.scrollToBottom();
    });

    expect(result.current.unseenCount).toBe(0);
  });

  it('should handle multiple message updates', () => {
    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScrollToBottom(messages as any[]),
      { initialProps: { messages: [] as any[] } }
    );

    rerender({ messages: [{}] });
    rerender({ messages: [{}, {}] });
    rerender({ messages: [{}, {}, {}] });

    expect(result.current.unseenCount).toBe(0);
  });

  it('should handle different scroll thresholds', () => {
    const { result: result1 } = renderHook(() => useAutoScrollToBottom([], true, 10));
    const { result: result2 } = renderHook(() => useAutoScrollToBottom([], true, 200));

    expect(result1.current.isNearBottom).toBe(true);
    expect(result2.current.isNearBottom).toBe(true);
  });

  it('should handle component cleanup', () => {
    const { result, unmount } = renderHook(() => useAutoScrollToBottom([]));
    const mockElement = createMockElement();

    act(() => {
      // @ts-expect-error - mock element assignment for testing
      result.current.containerRef.current = mockElement;
    });

    unmount();

    // Should not throw after unmount
    expect(() => result.current.scrollToBottom()).not.toThrow();
  });
});