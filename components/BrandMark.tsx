import React from 'react';

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = 'w-5 h-5' }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 6L56 20V44L32 58L8 44V20L32 6Z" />
        <path d="M32 6V58" />
        <path d="M8 20L32 34L56 20" />
        <path d="M8 44L32 30L56 44" />
        <path d="M23 24C23 20.7 25.7 18 29 18H35C38.3 18 41 20.7 41 24" />
        <path d="M21 34C21 31.2 23.2 29 26 29H38C40.8 29 43 31.2 43 34" />
        <path d="M24 41L20.5 45" />
        <path d="M40 41L43.5 45" />
      </g>
    </svg>
  );
}