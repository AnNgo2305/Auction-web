import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '@/shared/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import {
  Bell,
  ChevronDown,
  KeyRound,
  Monitor,
  UsersRound,
  Shield,
  Clock3,
  Send,
  Ban,
  Settings,
  X,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { settingsPaths } from '@/features/setting/constants/setting.routes';
import { cn } from '@/shared/lib/utils';
import { useUser } from '@/shared/contexts/UserContext';
import { ROLES } from '@/shared/types/user';
import { Button } from '@/shared/ui/button';

export function SettingLayoutContent() {
  const [securityOpen, setSecurityOpen] = useState(false);
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const { currentUser } = useUser();
  const { toggleSidebar, setOpenMobile, isMobile } = useSidebar();

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 py-4 text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              if (isMobile) {
                setOpenMobile(false);
              } else {
                toggleSidebar();
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center gap-2">
            <Settings className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your account preferences.
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible
                    open={securityOpen}
                    onOpenChange={setSecurityOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Shield />
                        <span>Security</span>
                        <ChevronDown
                          className={cn(
                            'ml-auto transition-transform',
                            securityOpen && 'rotate-180',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <NavLink to={settingsPaths.password()}>
                              <KeyRound />
                              Change Password
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <NavLink to={settingsPaths.sessions()}>
                              <Monitor />
                              Your Sessions
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={settingsPaths.notifications()}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )
                      }
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Collapsible
                    open={relationshipOpen}
                    onOpenChange={setRelationshipOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <UsersRound />
                        <span>Relationship</span>
                        <ChevronDown
                          className={cn(
                            'ml-auto transition-transform',
                            relationshipOpen && 'rotate-180',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {currentUser?.role === ROLES.SELLER ? (
                          <>
                            <SidebarMenuSubItem>
                              <SidebarMenuButton asChild>
                                <NavLink to={settingsPaths.pendingRequests()}>
                                  <Clock3 className="h-4 w-4" />
                                  Pending Requests
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuButton asChild>
                                <NavLink to={settingsPaths.blockedUsers()}>
                                  <Ban className="h-4 w-4" />
                                  Blocked Users
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          </>
                        ) : (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <NavLink to={settingsPaths.sentRequests()}>
                                <Send className="h-4 w-4" />
                                Sent Requests
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center px-6">
          <SidebarTrigger className="z-50" />
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}
