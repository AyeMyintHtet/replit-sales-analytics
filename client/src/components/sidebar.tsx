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
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        return "bg-destructive/10 text-destructive";
      case "sales_manager":
        return "bg-primary/10 text-primary";
      case "sales_rep":
        return "bg-secondary/10 text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">MarketEdge</h1>
            <p className="text-xs text-muted-foreground">Sales Intelligence</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
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
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )} data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
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
          {logoutMutation.isPending ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
