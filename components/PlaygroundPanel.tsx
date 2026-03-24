"use client";
import React from 'react';
import PlaygroundUI from './ui/PlaygroundUI';
import { usePlayground } from './PlaygroundContext';
import i18n from './ui/i18n';
import { Bot } from 'lucide-react';

export default function PlaygroundPanel() {
  const { isOpen, open } = usePlayground();

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => open()}
          aria-label={i18n.openButton}
          title={i18n.openButton}
          className="fixed z-50 right-4 bottom-4 lg:bottom-auto lg:top-20 bg-emerald-600 hover:bg-emerald-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white/5"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      <PlaygroundUI />
    </>
  );
}

