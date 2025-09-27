// src/layouts/AppLayout.tsx
import React from 'react';
import Header, { HeaderProps } from '../ui/Header';
import FooterButton from '@/ui/FooterButton'; // ✅ 추가

type AppLayoutProps = HeaderProps & {
  children: React.ReactNode;
  footer?: React.ReactNode;
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
  onBrushClick,
  themePath = '/theme',
  rightExtra,
  onDrawerOpenChange,
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
        onBrushClick={onBrushClick}
        themePath={themePath}
        rightExtra={rightExtra}
        onDrawerOpenChange={onDrawerOpenChange}
      />

      {/* 본문 */}
      <main className="flex-1 w-full flex justify-center overflow-x-hidden">
        <div className="w-full max-w-[520px] px-8 py-4">
          {children}
          {hasFooter && <div className="h-24" aria-hidden />}
        </div>
      </main>

      {/* 고정 푸터 */}
      {hasFooter && (
        <footer className="z-10 fixed bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent backdrop-blur-[2px]">
          <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
            {footer ? (
              footer
            ) : (
              <FooterButton
                label={footerButtonLabel!}
                onClick={onFooterButtonClick}
                disabled={footerButtonDisabled}
              />
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
