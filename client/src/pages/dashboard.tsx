import { Sidebar } from "@/components/sidebar";
import { KPICards } from "@/components/kpi-cards";
import { PricingTrendChart } from "@/components/pricing-trend-chart";
import { CompetitorComparison } from "@/components/competitor-comparison";
import { CompetitorDataTable } from "@/components/competitor-data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, BarChart3, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Dashboard</h1>
              <p className="text-muted-foreground">Monitor competitor pricing and market trends</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <KPICards />

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PricingTrendChart />
            <CompetitorComparison />
          </div>

          {/* Data Table Section */}
          <CompetitorDataTable />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/add-data">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-quick-action-add">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Plus className="text-primary text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Add Competitor Data</h3>
                      <p className="text-sm text-muted-foreground">Input new pricing information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/market-trends">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-quick-action-trends">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-chart-2 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Market Analysis</h3>
                      <p className="text-sm text-muted-foreground">Generate trend reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/user-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-quick-action-users">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                      <Users className="text-chart-3 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Manage Users</h3>
                      <p className="text-sm text-muted-foreground">Configure access & roles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
