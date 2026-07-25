import React from 'react';
import { SidebarProvider } from '@/shared/ui/sidebar';
import { SellerHubLayoutContent } from '@/features/seller-hub/layout/SellerHubLayoutContent';

export function SellerHubLayout() {
  return (
    <SidebarProvider
      defaultOpen
      storageKey="seller-hub-sidebar"
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '16rem',
        } as React.CSSProperties
      }
    >
      <SellerHubLayoutContent />
    </SidebarProvider>
  );
}
