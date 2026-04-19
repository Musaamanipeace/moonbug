'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

function AuthStatus({ navigatingTo, onNavigate }: { navigatingTo: string | null, onNavigate: (href: string) => void}) {
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
  
  const isNavigating = navigatingTo === '/profile';

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pathname === '/profile'}>
        <Link href="/profile" onClick={() => onNavigate('/profile')}>
          {isNavigating ? <Loader2 className="animate-spin" /> : (user ? <User /> : <LogIn />)}
          <span>{user ? (user.isAnonymous ? 'Guest' : user.email?.split('@')[0]) : 'Profile'}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    // On a new page navigation, reset the loading state.
    setNavigatingTo(null);
  }, [pathname]);

  const handleNavigate = (href: string) => {
    // Only set loading state if navigating to a different page.
    if (pathname !== href) {
      setNavigatingTo(href);
    }
  };
  
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
                  <Link href={item.href} onClick={() => handleNavigate(item.href)}>
                    {navigatingTo === item.href ? <Loader2 className="animate-spin" /> : <item.icon />}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <AuthStatus navigatingTo={navigatingTo} onNavigate={handleNavigate} />
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
