const ACCESS_TOKEN_KEY = "bh.auth.accessToken";

let memoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  memoryToken = token;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (memoryToken) return memoryToken;
  const t = localStorage.getItem(ACCESS_TOKEN_KEY);
  memoryToken = t;
  return t;
}

export function clearAccessToken() {
  setAccessToken(null);
}
