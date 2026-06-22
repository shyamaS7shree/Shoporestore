'use client';

import Image from 'next/image';

type RoundLoaderProps = {
  label?: string;
  size?: number;
  className?: string;
};

export default function RoundLoader({ label = 'Loading...', size = 34, className = '' }: RoundLoaderProps) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 text-[14px] font-semibold text-slate-600 ${className}`}>
      <Image
        src="/loading.png"
        alt=""
        width={size}
        height={size}
        className="animate-spin"
        priority={false}
      />
      {label && <span>{label}</span>}
    </div>
  );
}
