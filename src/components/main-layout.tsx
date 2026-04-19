'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogIn,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/firebase';


const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-moon', label: 'My Moon', icon: Moon },
  { href: '/events', label: 'Events', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/snaps', label: 'Snaps', icon: Camera },
  { href: '/challenges', label: 'Challenges', icon: Swords },
  { href: '/posts', label: 'Posts', icon: BookOpen },
];

function AuthStatus() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  if (isUserLoading) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/profile'}>
          <Link href="/profile">
            <Loader2 className="animate-spin" />
            <span>Authenticating...</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pathname === '/profile'}>
        <Link href="/profile">
          {user ? <User /> : <LogIn />}
          <span>{user ? (user.isAnonymous ? 'Guest' : user.email?.split('@')[0]) : 'Profile'}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  
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
            {navItems.map((item) => (
               <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <AuthStatus />
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
