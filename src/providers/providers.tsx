'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains'; // add baseSepolia for testing
import { SidebarProvider } from './sidebar-provider';
export function Providers(props: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <OnchainKitProvider
        apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
        chain={baseSepolia} // add baseSepolia for testing
      >
        {props.children}
      </OnchainKitProvider>
    </SidebarProvider>
  );
}