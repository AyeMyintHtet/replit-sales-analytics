import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ChartLine, 
  ChartPie, 
  Database, 
  TrendingUp, 
  Plus, 
  Users, 
  Settings, 
  LogOut,
  User,
  ArrowBigLeftDash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartPie },
  { name: "Competitor Data", href: "/competitor-data", icon: Database },
  { name: "Market Trends", href: "/market-trends", icon: TrendingUp },
  { name: "Add Data", href: "/add-data", icon: Plus },
  { name: "User Management", href: "/user-management", icon: Users, adminOnly: true },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const {isCollapsed} = useDataStore((state)=> state)
  const dataStore = useDataStore()
  const [location] = useLocation();
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "sales_manager":
        return "Sales Manager";
      case "sales_rep":
        return "Sales Rep";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive";
      case "sales_manager":
        return "bg-primary text-primary";
      case "sales_rep":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  // Utility function to conditionally hide text content when sidebar is collapsed
  function getTextClass() {
    return isCollapsed ? "hidden" : "";
  }

  return (
    <div className={cn("bg-card border-r border-border flex flex-col fixed h-screen  transition-all duration-300 ", isCollapsed ? "w-16" : "w-64")}>
      {/* Logo and Brand */}
      <div className={cn("p-6  border-b border-border flex justify-between items-center", isCollapsed ? "pl-4 pb-8" : "pr-0 pb-5")}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className={cn(getTextClass())}>
            <h1 className="text-lg font-semibold text-foreground">MarketEdge</h1>
            <p className="text-xs text-muted-foreground">Sales Intelligence</p>
          </div>
        </div>
        <div className={cn("cursor-pointer rounded-lg p-2 hover:pr-3 transition-all duration-300", isCollapsed ? "rotate-180 absolute left-11 -top-2" : "")}>
        <ArrowBigLeftDash  size={25} strokeWidth={1} onClick={() => dataStore.toggleCollapsed()} />
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className={cn("flex-1 min-w-0", getTextClass())}>
            <p className={cn("text-sm font-medium text-foreground truncate")} data-testid="text-username">
              {user?.fullName || user?.username}
            </p>
            <p className={cn("text-xs ")}>
              <span className={cn(
                "inline-flex  items-center px-2 py-0.5 rounded-full text-xs  font-medium ",
                getRoleColor(user?.role || "")
              )} data-testid="text-role">
                {getRoleDisplay(user?.role || "")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            if (item.adminOnly && user?.role !== "admin") {
              return null;
            }

            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "p-2"
                  )} data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Icon className="w-4 h-4" />
                    <span className={cn(getTextClass())}>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full justify-start"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className={cn(getTextClass())}>{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
        </Button>
      </div>
    </div>
  );
}
