// src/features/user/useMe.ts
import { useCallback, useEffect, useState } from "react";
import { getUserMe, UserMeResponse } from "@/apis/user";
import { useAuth } from "@/features/auth/useAuth";

export function useMe() {
  const { isAuthenticated } = useAuth();
  const [me, setMe] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserMe();
      setMe(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMe(null);
      return;
    }
    void refresh();
  }, [isAuthenticated, refresh]);

  return { me, loading, error, refresh };
}
