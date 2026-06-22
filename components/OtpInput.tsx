'use client';

import { useRef } from 'react';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className = '',
  inputClassName = '',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\D/g, '').slice(0, length));
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, '').slice(-1);
            const nextDigits = [...digits];
            nextDigits[index] = nextDigit;
            updateValue(nextDigits);

            if (nextDigit && index < length - 1) {
              inputsRef.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) {
              inputsRef.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            onChange(pastedDigits);
            inputsRef.current[Math.min(pastedDigits.length, length - 1)]?.focus();
          }}
          className={`h-10 w-10 border border-slate-300 bg-white text-center text-[17px] font-bold text-[#071225] outline-none transition focus:border-[#a04f35] focus:ring-1 focus:ring-[#a04f35] disabled:bg-slate-50 ${inputClassName}`}
        />
      ))}
    </div>
  );
}
