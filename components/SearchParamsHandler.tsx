"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface SearchParamsHandlerProps {
  onDemoOpen: (isDemoOpen: boolean) => void;
}

export function SearchParamsHandler({ onDemoOpen }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      onDemoOpen(true);
    }
  }, [searchParams, onDemoOpen]);

  return null;
}

