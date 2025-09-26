// 상단 import 추가
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export function Drawer({
  anchor = "right",
  open,
  onClose,
  size,
  ariaLabel,
  children,
  // 새 옵션: 필요시 포털 끌 수 있게
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
  container?: Element; // 포털 대상 지정 가능(기본은 document.body)
}) {
  // ... (기존 로직 유지)

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px] backdrop-saturate-125"
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
            className={`fixed z-[999] bg-white text-neutral-900 shadow-2xl outline-none ${roundByAnchor} ${positionByAnchor}`}
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

  if (!usePortal) return content;
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  return target ? createPortal(content, target) : content;
}
