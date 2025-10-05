// src/components/DrawerAnchor.tailwind.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Generic Drawer (no MUI) — Tailwind CSS + framer-motion
 * - anchor: 'top' | 'right' | 'bottom' | 'left'
 * - open: boolean
 * - onClose: () => void
 * - size: number | string
 * - ariaLabel: string
 * - usePortal: boolean (기본 true) — body로 포털 렌더
 * - container: 포털 대상 지정 (기본 document.body)
 */
export function Drawer({
  anchor = "right",
  open,
  onClose,
  size,
  ariaLabel,
  children,
  usePortal = true,
  container,
}: {
  anchor?: "top" | "right" | "bottom" | "left";
  open: boolean;
  onClose?: () => void;
  size?: number | string;
  ariaLabel?: string;
  children?: React.ReactNode;
  usePortal?: boolean;
  container?: Element;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  const defaultSize = anchor === "left" || anchor === "right" ? "320px" : "56vh";
  const resolvedSize = size ?? defaultSize;

  // ESC 닫기
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // body 스크롤 잠금
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 초기 포커스
  React.useEffect(() => {
    if (open && panelRef.current) {
      const t = setTimeout(() => panelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const transitionSpring = { type: "spring", stiffness: 420, damping: 42 } as const;

  const initial =
    anchor === "left"  ? { x: "-100%" } :
    anchor === "right" ? { x: "100%" }  :
    anchor === "top"   ? { y: "-100%" } :
                          { y: "100%" };

  const animate =
    anchor === "left" || anchor === "right"
      ? { x: 0, transition: transitionSpring }
      : { y: 0, transition: transitionSpring };

  const exit =
    anchor === "left"  ? { x: "-100%", transition: { duration: 0.18 } } :
    anchor === "right" ? { x: "100%",  transition: { duration: 0.18 } } :
    anchor === "top"   ? { y: "-100%", transition: { duration: 0.18 } } :
                          { y: "100%",  transition: { duration: 0.18 } };

  const roundByAnchor =
    anchor === "left"
      ? "rounded-r-2xl"
      : anchor === "right"
      ? ""
      : anchor === "top"
      ? "rounded-b-2xl"
      : "rounded-t-2xl";

  const positionByAnchor = (() => {
    switch (anchor) {
      case "left":
        return "left-0 top-0 h-screen";
      case "right":
        return "right-0 top-0 h-screen";
      case "top":
        return "top-0 left-0 w-screen";
      case "bottom":
      default:
        return "bottom-0 left-0 w-screen";
    }
  })();

  const sizeStyle: React.CSSProperties =
    anchor === "left" || anchor === "right"
      ? { width: typeof resolvedSize === "number" ? `${resolvedSize}px` : resolvedSize }
      : { height: typeof resolvedSize === "number" ? `${resolvedSize}px` : resolvedSize };

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-1000 bg-black/40 backdrop-blur-[2px] backdrop-saturate-125"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.12 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || `${anchor} drawer`}
            tabIndex={-1}
            className={`fixed z-10000 bg-white text-neutral-900 shadow-2xl outline-none ${roundByAnchor} ${positionByAnchor}`}
            style={sizeStyle}
            initial={initial}
            animate={animate}
            exit={exit}
          >
            <div className="flex h-full max-h-full flex-col">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // SSR 안전 처리 및 포털 렌더
  if (!usePortal) return content;
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  return target ? createPortal(content, target) : content;
}

/**
 * Demo: DrawerAnchor — MUI Joy 예제와 유사한 인터랙션
 */
export default function DrawerAnchor() {
  const [open, setOpen] = React.useState({ top: false, right: false, bottom: false, left: false });
  const toggle = (anchor: keyof typeof open, next?: boolean) => () =>
    setOpen((s) => ({ ...s, [anchor]: typeof next === "boolean" ? next : !s[anchor] }));
  const closeAll = () => setOpen({ top: false, right: false, bottom: false, left: false });

  const anchors: Array<keyof typeof open> = ["top", "right", "bottom", "left"];

  return (
    <div className="grid min-h-[60vh] place-items-center bg-[var(--bg-1)] p-6">
      {/* Button Group */}
      <div className="inline-flex gap-2 rounded-full bg-[var(--surface-2,#f6f7fa)] p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)]">
        {anchors.map((a) => (
          <button
            key={a}
            aria-pressed={open[a]}
            onClick={toggle(a, true)}
            data-active={open[a] ? "true" : "false"}
            className="cursor-pointer select-none rounded-full border-0 bg-[var(--surface-1,#fff)] px-3.5 py-2.5 font-semibold tracking-wide text-[var(--text-2,#6f737b)] transition-[transform,box-shadow,background,color] duration-150 ease-out data-[active=true]:bg-[var(--brand-1,#0e7400)] data-[active=true]:text-white data-[active=true]:shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {a}
          </button>
        ))}
      </div>

      {/* Drawers (포털 기본 활성화) */}
      {anchors.map((a) => (
        <Drawer key={a} anchor={a} open={open[a]} onClose={toggle(a, false)} ariaLabel={`${a} drawer`}>
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-[var(--surface-2,#f1f4f8)] px-4 py-4">
            <h3 className="typo-h3 m-0 flex-1 text-[18px] font-bold text-[var(--text-1,#101014)]">Mailbox</h3>
            <button
              onClick={toggle(a, false)}
              aria-label="Close drawer"
              className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[18px] leading-none text-[var(--text-2,#6f737b)] hover:bg-[var(--surface-2,#f1f4f8)]"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <section className="flex-1 overflow-auto p-2 pt-2">
            <div className="mx-2 mb-1 mt-3 text-[12px] uppercase tracking-[0.06em] text-[var(--text-3,#969ba5)]">Primary</div>
            <ul className="mb-2 list-none space-y-1 px-1 pb-2">
              {["Inbox", "Starred", "Send email", "Drafts"].map((t) => (
                <li key={t}>
                  <button className="w-full cursor-pointer select-none rounded-[10px] border-0 bg-transparent px-3 py-3 text-left font-semibold text-[var(--text-1,#101014)] hover:bg-[var(--surface-2,#f1f4f8)] active:translate-y-0.5">
                    {t}
                  </button>
                </li>
              ))}
            </ul>

            <hr className="my-2 border-t border-[var(--surface-2,#f1f4f8)]" />

            <div className="mx-2 mb-1 mt-3 text-[12px] uppercase tracking-[0.06em] text-[var(--text-3,#969ba5)]">System</div>
            <ul className="mb-2 list-none space-y-1 px-1 pb-2">
              {["All mail", "Trash", "Spam"].map((t) => (
                <li key={t}>
                  <button className="w-full cursor-pointer select-none rounded-[10px] border-0 bg-transparent px-3 py-3 text-left font-semibold text-[var(--text-1,#101014)] hover:bg-[var(--surface-2,#f1f4f8)] active:translate-y-0.5">
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-auto flex justify-end gap-2 border-t border-[var(--surface-2,#f1f4f8)] px-4 pb-4 pt-3">
            <button
              onClick={closeAll}
              className="rounded-xl border-0 bg-[var(--brand-1,#0e7400)] px-3.5 py-2.5 font-bold text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              확인
            </button>
          </div>
        </Drawer>
      ))}
    </div>
  );
}
