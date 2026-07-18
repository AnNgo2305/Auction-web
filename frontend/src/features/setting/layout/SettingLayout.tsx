import { SidebarProvider } from '@/shared/ui/sidebar';
import React from 'react';
import { SettingLayoutContent } from '@/features/setting/layout/SettingLayoutContent';

export function SettingLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '20rem',
          '--sidebar-width-mobile': '20rem',
        } as React.CSSProperties
      }
    >
      <SettingLayoutContent />
    </SidebarProvider>
  );
}
