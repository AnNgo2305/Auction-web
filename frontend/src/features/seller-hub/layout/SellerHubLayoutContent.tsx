import { Menu, Package, Store, Tags, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { sellerHubPaths } from '@/features/seller-hub/constants/seller-hub.routes';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar';

export function SellerHubLayoutContent() {
  const { toggleSidebar, setOpenMobile, isMobile, state } = useSidebar();

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-background top-17 h-[calc(100vh-4rem)]"
      >
        <SidebarHeader className="relative flex h-14 items-center border-b px-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setOpenMobile(false)}
            >
              <X className="size-4" />
            </Button>
          )}

          <div className="flex items-center gap-3 overflow-hidden">
            <Store className="size-5 shrink-0" />
            <span
              className={cn(
                'truncate text-base font-semibold transition-all duration-200',
                state === 'collapsed' && 'w-0 opacity-0',
              )}
            >
              Seller Hub
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Products">
                <NavLink to={sellerHubPaths.products()}>
                  <Package />
                  <span>Products</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Categories">
                <NavLink to={sellerHubPaths.productCategories()}>
                  <Tags />
                  <span>Categories</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="fixed top-16 left-0 z-50 ml-1 flex h-16 items-center">
          <Button variant="ghost" size="icon-lg" onClick={toggleSidebar}>
            <Menu className="size-6" />
          </Button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}
