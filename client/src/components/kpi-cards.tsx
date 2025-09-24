import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Percent, Package, PieChart } from "lucide-react";

export function KPICards() {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["/api/kpi"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4 flex items-center space-x-1">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Competitors Tracked",
      value: (kpiData as any)?.competitorsTracked || 0,
      change: "+12%",
      icon: Building,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Avg Price Difference",
      value: `${(kpiData as any)?.avgPriceDifference || 0}%`,
      change: "+2.1%",
      icon: Percent,
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      label: "Products Monitored",
      value: (kpiData as any)?.productsMonitored || 0,
      change: "+8 new this week",
      icon: Package,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      label: "Market Share",
      value: `${(kpiData as any)?.marketShare || 0}%`,
      change: "+1.2%",
      icon: PieChart,
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} data-testid={`card-kpi-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground" data-testid={`text-kpi-label-${index}`}>
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`text-kpi-value-${index}`}>
                    {kpi.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${kpi.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-chart-2" data-testid={`text-kpi-change-${index}`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
