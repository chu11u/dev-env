'use client';

import type { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/i18n';

export function LocaleWrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

export default LocaleWrapper;
