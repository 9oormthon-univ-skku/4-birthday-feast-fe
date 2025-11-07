import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type ModalType = "confirm" | "alert" | "prompt" | "welcome";

export type ConfirmModalProps = {
  open: boolean;
  type?: ModalType;
  message?: string | React.ReactNode;
  title?: string | React.ReactNode;
  helperText?: string | React.ReactNode;
  highlightText?: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => boolean;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  className?: string;

  /** 상위 레이어 포털 사용 (기본 true) */
  topLayer?: boolean;
  /** 모달 z-index (기본 10000) */
  zIndex?: number;
};

function getOrCreateTopLayer(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  const id = "top-layer-root";
  let el = document.getElementById(id) as HTMLElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
  }
  return el;
}

export default function Modal({
  open,
  type = "confirm",
  title,
  message,
  helperText,
  highlightText,
  confirmText,
  cancelText,
  defaultValue = "",
  validate,
  onConfirm,
  onCancel,
  onClose,
  closeOnBackdrop = true,
  className,
  topLayer = true,
  zIndex = 10000,
}: ConfirmModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [errorText, setErrorText] = useState<string | null>(null);
  const okBtnRef = useRef<HTMLButtonElement>(null);

  const container = useMemo<HTMLElement | null>(() => {
    if (typeof window === "undefined") return null;
    return topLayer ? getOrCreateTopLayer() : document.body;
  }, [topLayer]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => okBtnRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setErrorText(null);
    }
  }, [open, defaultValue]);

  const isPrompt = type === "prompt";
  const isAlert = type === "alert";
  const isConfirm = type === "confirm";
  const isWelcome = type === "welcome";

  const _confirmText = confirmText ?? (isAlert || isWelcome ? "확인" : "예");
  const _cancelText = cancelText ?? "아니오";

  const handleBackdropClick = () => {
    if (!closeOnBackdrop) return;
    onClose?.();
    if (isConfirm) onCancel?.();
  };

  const handleConfirmClick = () => {
    if (isPrompt) {
      const valid = validate ? validate(value) : value.trim().length > 0;
      if (!valid) {
        setErrorText("닉네임은 공란일 수 없습니다.");
        return;
      }
      setErrorText(null);
      onConfirm?.(value.trim());
      onClose?.();
    } else {
      onConfirm?.();
      onClose?.();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === "Escape") {
      onClose?.();
      if (isConfirm) onCancel?.();
    }
    if (e.key === "Enter" && isPrompt) {
      e.preventDefault();
      handleConfirmClick();
    }
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center font-pretendard"
      aria-modal="true"
      role="dialog"
      style={{ zIndex }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={handleBackdropClick} />
      <div
        className={clsx(
          "relative mx-auto w-[74%] max-w-sm rounded-[5px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]",
          "animate-[fadeIn_120ms_ease-out]",
          className
        )}
        onKeyDown={handleKeyDown}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          {isWelcome && (
            <div className="text-base font-semibold text-[#FF8B8B]">
              {highlightText ? (
                <>
                  <span className="text-[#FF8B8B]">{highlightText}</span>
                  <span className="text-[#373737]">님!</span>
                </>
              ) : null}
            </div>
          )}

          {title && <h3 className="text-base font-semibold text-[#383838]">{title}</h3>}

          {message && (
            <div className="whitespace-pre-line break-keep text-base font-semibold leading-6 text-[#373737]">
              {message}
            </div>
          )}

          {helperText && <span className="text-sm leading-5 text-[#A0A0A0]">{helperText}</span>}

          {isPrompt && (
            <div className="mt-8">
              <input
                className={clsx(
                  "w-full rounded-[5px] bg-gray-100 px-4 py-3 text-gray-900",
                  "placeholder:text-gray-400 outline-none",
                  "focus:ring-2 focus:ring-rose-200"
                )}
                placeholder={defaultValue}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (errorText) setErrorText(null); // 입력 시 에러 제거
                }}
              />
              {errorText && (
                <span className="mt-2 ms-2 text-start text-sm text-[#FF8B8B]">{errorText}</span>
              )}
            </div>
          )}
        </div>

        <div className="h-px mx-6 bg-gray-200" />

        <div className="flex">
          {isConfirm ? (
            <>
              <button
                className="flex-1 py-3 text-base font-semibold text-gray-400 focus:outline-none active:opacity-80"
                onClick={() => {
                  onCancel?.();
                  onClose?.();
                }}
              >
                {_cancelText}
              </button>
              <div className="h-10 w-px self-center bg-gray-200" />
              <button
                ref={okBtnRef}
                className="flex-1 py-4 text-base font-semibold text-[#FF8B8B] focus:outline-none active:opacity-80"
                onClick={() => onConfirm?.()}
              >
                {_confirmText}
              </button>
            </>
          ) : (
            <button
              ref={okBtnRef}
              className={clsx(
                "w-full py-3 text-base font-semibold focus:outline-none active:opacity-80",
                "text-gray-500"
              )}
              onClick={handleConfirmClick}
            >
              {_confirmText}
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px)} to {opacity:1; transform:translateY(0)} }`}</style>
    </div>
  );

  return container ? createPortal(modal, container) : modal;
}
