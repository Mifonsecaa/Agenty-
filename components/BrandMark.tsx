import React from 'react';

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = 'w-5 h-5' }: BrandMarkProps) {
  return (
    <img
      src="/branding/iconn-gradient.svg"
      alt="Brainia"
      className={`${className} object-contain transition-all duration-200 group-hover:brightness-110 group-hover:saturate-110`}
      decoding="async"
      loading="eager"
    />
  );
}