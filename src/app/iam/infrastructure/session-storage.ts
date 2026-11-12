import {UserResource} from './users-response';

const SESSION_STORAGE_KEY = 'stockia.session';

/** What is remembered of a session in the browser: the token and the signed-in user. */
export interface StoredSession {
  token: string;
  user: UserResource;
}

/**
 * Keeps the session in localStorage so a reload does not sign the user out.
 * @author DataBit
 */
export class SessionStorage {
  static load(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      const session = raw ? (JSON.parse(raw) as StoredSession) : null;
      return session?.token && session?.user ? session : null;
    } catch {
      return null;
    }
  }

  static save(session: StoredSession | null): void {
    try {
      if (session) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* storage blocked: the session lasts until the tab is closed */
    }
  }
}
