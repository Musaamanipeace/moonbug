
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Moon,
  Calendar,
  Sparkles,
  Camera,
  Swords,
  BookOpen,
  User,
  PanelLeft,
} from 'lucide-react';
import { Button } from './ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-mono font-bold text-lg">
              Mb
            </div>
            <span className="font-bold text-lg">Moonbug</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive>
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Moon />
                My Moon
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Sparkles />
                Events
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Calendar />
                Calendar
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Camera />
                Snaps
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Swords />
                Challenges
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <BookOpen />
                Posts
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <User />
                Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex-1 flex flex-col">
        {isMobile && (
          <header className="p-2 border-b flex items-center">
            <SidebarTrigger>
                <PanelLeft />
            </SidebarTrigger>
             <div className="flex items-center gap-2 mx-auto">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-accent-foreground font-mono font-bold text-sm">
                  Mb
                </div>
                <span className="font-bold text-md">Moonbug</span>
              </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </div>
  );
}
