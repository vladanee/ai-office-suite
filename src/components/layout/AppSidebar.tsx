import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  Play, 
  BarChart3, 
  Plug, 
  Settings, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/departments', icon: Building2, label: 'Departments' },
  { path: '/personas', icon: Users, label: 'Personas' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/workflows', icon: Workflow, label: 'Workflows' },
  { path: '/runs', icon: Play, label: 'Runs' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/integrations', icon: Plug, label: 'Integrations' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, currentOffice } = useAppStore();
  const { user } = useAuth();

  // Derive user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    const content = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className={cn(
          "w-5 h-5 flex-shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium truncate"
          >
            {item.label}
          </motion.span>
        )}
        {isActive && !sidebarCollapsed && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
          />
        )}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="AI Office Dashboard"
        >
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-lg text-foreground"
            >
              AI Office
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Office Switcher */}
      {currentOffice && !sidebarCollapsed && (
        <div className="px-3 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentOffice.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentOffice.description || 'Workspace'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        {sidebarCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/settings"
                className="flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link
            to="/settings"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </Link>
        )}
      </div>
    </motion.aside>
  );
}