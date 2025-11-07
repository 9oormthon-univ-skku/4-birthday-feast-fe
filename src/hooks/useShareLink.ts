// src/hooks/useShareLink.ts
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getLastQuizId, getStoredUserId } from "@/stores/authStorage";
import { qk } from "@/apis/queryKeys";
import type { UserMeResponse } from "@/apis/user";
import { toPathId } from "@/apis/apiUtils";

function isValidQuizId(v: string | null): v is string {
  if (!v) return false;
  // 숫자만 허용 
  return /^\d+$/.test(v);
}

function isValidCode(v: string | undefined | null): v is string {
  if (!v) return false;
  const t = v.trim();
  // 영문/숫자/하이픈 정도만 허용 (백엔드 규칙 확인하기) ☁️
  return /^[A-Za-z0-9_-]{4,64}$/.test(t);
}

export function useShareLink(code: string | undefined | null) {
  const { userId: userIdParam } = useParams();
  const storedId = getStoredUserId();
  const userId = userIdParam ?? storedId ?? null;

  // ✅ me 캐시에서 사용자 이름 가져오기 (네트워크 호출 없음)
  const qc = useQueryClient();
  const me = qc.getQueryData<UserMeResponse>(qk.auth.me) ?? null;
  const rawName = me?.name?.trim();
  const shareName = rawName && rawName.length > 0 ? rawName : undefined;

  const url = useMemo(() => {
    if (!userId) return "";
    if (!isValidCode(code)) return ""; // 코드가 유효하지 않으면 링크 제공X;

    // quizId는 로컬스토리지에서 로드 (없으면 null)
    let quizId: string | null = null;
    try {
      const raw = getLastQuizId();
      quizId = isValidQuizId(raw) ? raw : null;
    } catch {
      // private mode 등 예외는 무시
    }

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const params = new URLSearchParams();
    params.set("code", code!.trim());
    if (quizId) params.set("quizId", quizId);
    if (shareName) params.set("name", shareName);

    const base = `/u/${toPathId(userId)}/main`;
    return origin ? `${origin}${base}?${params.toString()}` : `${base}?${params.toString()}`;
  }, [code, userId, shareName]);

  const share = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");

    const title = shareName ? `${shareName}님의 생일한상` : "생일한상";
    const text = "친구의 생일을 축하해주세요.🎉"

    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title, text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("링크를 클립보드에 복사했어요.");
      } else {
        alert(url);
      }
    } catch {
      // 사용자가 공유 취소 시 무시
    }
  }, [url, shareName]);

  const copy = useCallback(async () => {
    if (!url) return alert("공유 가능한 링크가 없습니다.");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("링크를 복사했어요.");
    } else {
      alert(url);
    }
  }, [url]);

  return { url, share, copy };
}
