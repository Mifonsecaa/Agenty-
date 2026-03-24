"use client";
import React from 'react';
import PlaygroundUI from './ui/PlaygroundUI';
import { usePlayground } from './PlaygroundContext';
import i18n from './ui/i18n';

export default function PlaygroundPanel() {
  const { isOpen, open } = usePlayground();

  return (
    <>
      {!isOpen && (
        <button onClick={() => open()} title={i18n.openButton} className="fixed z-50 right-4 bottom-4 lg:bottom-auto lg:top-20 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-full shadow-lg">
          {i18n.openButton}
        </button>
      )}

      <PlaygroundUI />
    </>
  );
}

