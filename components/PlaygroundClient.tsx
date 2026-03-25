"use client";
import React from 'react';
import { PlaygroundProvider } from './PlaygroundContext';
import PlaygroundPanel from './PlaygroundPanel';

export default function PlaygroundClient() {
  return (
    <PlaygroundProvider>
      <PlaygroundPanel />
    </PlaygroundProvider>
  );
}

