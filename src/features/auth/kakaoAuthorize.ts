// 권한(스코프) 카카오 콘솔과 일치시키기
export function kakaoAuthorize(
  scopes: string[] = ["profile_nickname", "profile_image", "birthday", "birthyear"]
) {
  const Kakao = (window as any).Kakao;
  if (!Kakao?.isInitialized?.()) {
    alert("카카오 SDK 초기화가 아직 완료되지 않았어요. 잠시 후 다시 시도해주세요.");
    return;
  }

  const redirectUri = `${window.location.origin}/auth/kakao/callback`;
  const state = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  sessionStorage.setItem("kakao_oauth_state", state);

  Kakao.Auth.authorize({
    redirectUri,
    state,
    scope: scopes.join(" "),
    // prompt: "select_account", // 필요 시 계정 선택 강제
  });
}
