// src/layouts/AppLayout.tsx
import React from 'react';
import Header, { HeaderProps } from '../components/Header';

type AppLayoutProps = HeaderProps & {
  children: React.ReactNode;
  /** 본문/푸터의 최대 너비 (헤더와 정렬 일치) */
  /** 커스텀 푸터 내용을 직접 넣고 싶을 때 (있으면 이것이 우선) */
  footer?: React.ReactNode;
  /** 1버튼 푸터용 props */
  footerButtonLabel?: string;
  onFooterButtonClick?: () => void;
  footerButtonDisabled?: boolean;
};

export default function AppLayout({
  children,
  // Header props
  title,
  showBack = false,
  onBack,
  showMenu = true,
  showBrush = true,
  compact = false,
  onBrushClick,
  themePath = '/theme',
  rightExtra,
  onDrawerOpenChange,
  // Layout options
  // Footer options
  footer,
  footerButtonLabel,
  onFooterButtonClick,
  footerButtonDisabled,
}: AppLayoutProps) {
  const hasFooter = Boolean(footer || footerButtonLabel);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        title={title}
        showBack={showBack}
        onBack={onBack}
        showMenu={showMenu}
        showBrush={showBrush}
        compact={compact}
        onBrushClick={onBrushClick}
        themePath={themePath}
        rightExtra={rightExtra}
        onDrawerOpenChange={onDrawerOpenChange}
      />

      {/* 본문 */}
      <main className="flex-1 w-full flex justify-center overflow-x-hidden">
        <div className={`w-full max-w-[520px] px-4 py-4`}>
          {children}
          {/* 고정 푸터가 있을 때만, 겹침 방지 여백 확보 */}
          {hasFooter && <div className="h-24" aria-hidden />}
        </div>
      </main>

      {/* 고정 푸터 */}
      {hasFooter && (
        <footer className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className={`w-full px-4 py-4 bg-gradient-to-t from-white to-white/70 backdrop-blur pb-[env(safe-area-inset-bottom)]`}>
            {footer ? (
              footer
            ) : (
              <button
                type="button"
                disabled={footerButtonDisabled}
                onClick={onFooterButtonClick}
                className="w-full h-12 rounded-xl bg-[#FF8B8B] hover:bg-[#ff9c9c] active:bg-[#ff7a7a] disabled:opacity-50 text-white font-semibold transition shadow-sm"
              >
                {footerButtonLabel}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
