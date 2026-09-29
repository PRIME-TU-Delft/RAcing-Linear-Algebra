/**
 * In-memory stand-in for the socket.io client in `src/socket.ts`.
 *
 * `setupTests.ts` swaps the real socket for this one in every test, so no test
 * ever opens a network connection. Use it to assert what the client sends and
 * to simulate what the server sends:
 *
 *     expect(mockSocket.emit).toHaveBeenCalledWith("authenticate", "pw")
 *     act(() => serverEmit("authenticated", true))
 */
import { Mock, vi } from "vitest"

type Handler = (...args: any[]) => void

interface MockSocket {
    on: Mock<(event: string, handler: Handler) => MockSocket>
    off: Mock<(event: string, handler?: Handler) => MockSocket>
    emit: Mock<(...args: unknown[]) => MockSocket>
    connect: Mock<() => MockSocket>
    disconnect: Mock<() => MockSocket>
}

const handlers = new Map<string, Set<Handler>>()

export const mockSocket: MockSocket = {
    on: vi.fn((event: string, handler: Handler) => {
        if (!handlers.has(event)) handlers.set(event, new Set())
        handlers.get(event)?.add(handler)
        return mockSocket
    }),
    // Like socket.io: without a handler, removes every listener for the event.
    off: vi.fn((event: string, handler?: Handler) => {
        if (handler) handlers.get(event)?.delete(handler)
        else handlers.delete(event)
        return mockSocket
    }),
    emit: vi.fn(() => mockSocket),
    connect: vi.fn(() => mockSocket),
    disconnect: vi.fn(() => mockSocket),
}

/** Calls every client listener registered for `event`, as if the server emitted it. */
export function serverEmit(event: string, ...args: unknown[]) {
    handlers.get(event)?.forEach((handler) => handler(...args))
}

/** Number of client listeners currently registered for `event`. */
export function listenerCount(event: string) {
    return handlers.get(event)?.size ?? 0
}

/** Clears listeners and call history. Runs before every test (see setupTests.ts). */
export function resetMockSocket() {
    handlers.clear()
    Object.values(mockSocket).forEach((fn: Mock) => fn.mockClear())
}
