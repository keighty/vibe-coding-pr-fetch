"use client";

import { useEffect } from 'react';
import { initializeHoneycomb } from '@/lib/honeycomb';

export default function HoneycombProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Honeycomb on the client side
    initializeHoneycomb();
  }, []);

  return <>{children}</>;
}
