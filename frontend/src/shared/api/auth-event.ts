export const AUTH_EVENTS = {
  LOGOUT: 'auth:logout',
} as const;

const authEventTarget = new EventTarget();

export function emitLogoutEvent(): void {
  authEventTarget.dispatchEvent(new Event(AUTH_EVENTS.LOGOUT));
}

export function onLogoutEvent(handler: () => void): () => void {
  authEventTarget.addEventListener(AUTH_EVENTS.LOGOUT, handler);

  return () => {
    authEventTarget.removeEventListener(AUTH_EVENTS.LOGOUT, handler);
  };
}
