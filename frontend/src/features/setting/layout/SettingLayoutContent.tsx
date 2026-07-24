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
  useSidebar,
} from '@/shared/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import {
  Bell,
  KeyRound,
  Monitor,
  UsersRound,
  Shield,
  Clock3,
  Send,
  Ban,
  Settings,
  X,
  Menu,
  ChevronRight,
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
  const { toggleSidebar, setOpenMobile, isMobile, state } = useSidebar();

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-background top-17 h-[calc(100vh-4rem)]"
      >
        <SidebarHeader className="py-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setOpenMobile(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="mt-15 ml-1">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center rounded-xl">
                <Settings className="h-6 w-6" />
              </div>
              {state === 'expanded' && (
                <h1 className="text-xl font-semibold tracking-tight">
                  Settings
                </h1>
              )}
            </div>
            {state === 'expanded' && (
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Manage your account preferences.
              </p>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="-ml-1">
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
                        <Shield className="size-10"/>
                        <span className="font-medium">Security</span>
                        <ChevronRight
                          className={cn(
                            'ml-auto transition-transform',
                            securityOpen && 'rotate-90',
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
                              My Sessions
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
                      <span className="-ml-1 font-medium">Notifications</span>
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
                        <span className="font-medium">Relationship</span>
                        <ChevronRight
                          className={cn(
                            'ml-auto transition-transform',
                            relationshipOpen && 'rotate-90',
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
                                <Send className="h-4 w-4 shrink-0" />
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
        <header className="fixed top-16 ml-1 left-0 z-50 flex h-16 items-center gap-3">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={toggleSidebar}
          >
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
