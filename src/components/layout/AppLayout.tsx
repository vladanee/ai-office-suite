import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <AppSidebar />
      
      <main 
        id="main-content" 
        className="flex-1 overflow-x-hidden"
        role="main"
      >
        <Outlet />
      </main>
    </div>
  );
}