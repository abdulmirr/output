'use client';

import { createPortal } from 'react-dom';
import { useSyncExternalStore, ReactNode } from 'react';

const subscribe = () => () => {};

export function Portal({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!isClient) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
}
