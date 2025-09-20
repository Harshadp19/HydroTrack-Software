import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  History,
  FileText,
  Brain,
  Settings,
  User,
  Droplets,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Historical Data", url: "/history", icon: History },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "AI Recommendations", url: "/ai", icon: Brain },
  { title: "Controls", url: "/controls", icon: Droplets },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <div className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-glow">
                <Droplets className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">HydroTrack</h1>
                <p className="text-xs text-sidebar-foreground/70">Smart Agriculture</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-200"
          >
            {collapsed ? (
              <Menu className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <X className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                "hover:bg-sidebar-accent hover:shadow-elevation",
                isActive(item.url) 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                  : "text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive(item.url) ? "animate-float" : ""
              )} />
              {!collapsed && (
                <span className="font-medium animate-fade-in">{item.title}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-sidebar-accent/50 rounded-lg border border-sidebar-border animate-slide-up">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
              <span className="text-xs text-sidebar-foreground/70">System Status</span>
            </div>
            <p className="text-xs text-sidebar-foreground">All systems operational</p>
            <div className="mt-2 bg-sidebar-border rounded-full h-1">
              <div className="bg-gradient-primary h-1 rounded-full w-4/5 transition-all duration-1000"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}