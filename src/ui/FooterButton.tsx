import React from 'react';
import clsx from 'clsx';

export type FooterButtonProps = {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export default function FooterButton({
  label,
  onClick,
  disabled,
  className,
  type = 'button',
}: FooterButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'w-full h-12 mb-6 rounded-[5px] bg-[#FF8B8B] text-white font-semibold',
        'shadow-sm transition disabled:opacity-50',
        className
      )}
    >
      {label}
    </button>
  );
}
