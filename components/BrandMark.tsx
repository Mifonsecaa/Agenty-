import React from 'react';

type BrandMarkProps = {
  className?: string;
  variant?: 'gradient' | 'white';
};

export default function BrandMark({ className = 'w-5 h-5', variant = 'gradient' }: BrandMarkProps) {
  const src = variant === 'white' ? '/branding/iconn.svg' : '/branding/iconn-gradient.svg';

  return (
    <img
      src={src}
      alt="Brainia"
      className={`${className} object-contain transition-all duration-200 group-hover:brightness-110 group-hover:saturate-110`}
      decoding="async"
      loading="eager"
    />
  );
}