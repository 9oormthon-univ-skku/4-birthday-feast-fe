export const ACCESS_TOKEN_KEY = "bh.auth.accessToken";

let memoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  memoryToken = token;
  console.log(memoryToken);
  if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  // return memoryToken;
  if (memoryToken) return memoryToken;
  const t = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  memoryToken = t;
  return t;
}

export function clearAccessToken() {
  setAccessToken(null);
}
