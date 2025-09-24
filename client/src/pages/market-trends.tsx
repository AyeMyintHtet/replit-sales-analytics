import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Calculator } from "lucide-react";

export default function MarketTrends() {
  const [timeframe, setTimeframe] = useState("30");
  const [analysisType, setAnalysisType] = useState("pricing");

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/price-trends", { days: timeframe }],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, { days: string }];
      const searchParams = new URLSearchParams({ days: params.days });
      return fetch(`/api/price-trends?${searchParams}`).then(res => res.json());
    },
  });

  const { data: competitorsData, isLoading: competitorsLoading } = useQuery({
    queryKey: ["/api/top-competitors", { limit: "10" }],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, { limit: string }];
      const searchParams = new URLSearchParams({ limit: params.limit });
      return fetch(`/api/top-competitors?${searchParams}`).then(res => res.json());
    },
  });

  const { data: kpiData } = useQuery({
    queryKey: ["/api/kpi"],
  });

  // Calculate statistical metrics
  const calculateStatistics = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const prices = data.map(item => parseFloat(item.price)).filter(price => !isNaN(price));
    if (prices.length === 0) return null;

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2),
      min: Math.min(...prices).toFixed(2),
      max: Math.max(...prices).toFixed(2),
      count: prices.length
    };
  };

  // Process data for different chart types
  const processChartData = () => {
    if (!trendsData) return [];

    const dailyData = trendsData.reduce((acc: any[], item: any) => {
      const date = new Date(item.date).toLocaleDateString();
      const existingEntry = acc.find(entry => entry.date === date);
      
      if (existingEntry) {
        existingEntry.totalPrice += parseFloat(item.price);
        existingEntry.count += 1;
        existingEntry.avgPrice = existingEntry.totalPrice / existingEntry.count;
      } else {
        acc.push({
          date,
          totalPrice: parseFloat(item.price),
          count: 1,
          avgPrice: parseFloat(item.price),
        });
      }
      
      return acc;
    }, []);

    return dailyData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processChartData();
  const statistics = calculateStatistics(trendsData || []);

  // Prepare competitor distribution data for pie chart
  const competitorDistribution = competitorsData?.map((comp: any, index: number) => ({
    name: comp.name,
    value: comp.priceCount || 0,
    color: `hsl(var(--chart-${(index % 5) + 1}))`
  })) || [];

  const COLORS = ['hsl(221, 83%, 53%)', 'hsl(160, 84%, 39%)', 'hsl(43, 96%, 56%)', 'hsl(262, 83%, 58%)', 'hsl(12, 76%, 61%)'];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Market Trends</h1>
              <p className="text-muted-foreground">Statistical analysis and market insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-40" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-40" data-testid="select-analysis-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pricing">Pricing Analysis</SelectItem>
                  <SelectItem value="competitor">Competitor Analysis</SelectItem>
                  <SelectItem value="statistical">Statistical View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-trend-metric-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price Volatility</p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics ? `${((parseFloat(statistics.standardDeviation) / parseFloat(statistics.mean)) * 100).toFixed(1)}%` : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge variant="secondary" className="text-xs">Coefficient of Variation</Badge>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-trend-metric-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${statistics?.mean || "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Calculator className="text-chart-2" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-muted-foreground">Median: ${statistics?.median || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-trend-metric-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price Range</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${statistics ? (parseFloat(statistics.max) - parseFloat(statistics.min)).toFixed(2) : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-chart-3" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    ${statistics?.min} - ${statistics?.max}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-trend-metric-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.count || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <PieChartIcon className="text-chart-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-muted-foreground">Price entries analyzed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Trend Chart */}
            <Card data-testid="card-price-trend-analysis">
              <CardHeader>
                <CardTitle>Daily Average Price Trends</CardTitle>
                <CardDescription>
                  Average pricing trends over the selected timeframe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        className="text-muted-foreground" 
                        fontSize={12}
                      />
                      <YAxis 
                        className="text-muted-foreground" 
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, "Avg Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgPrice"
                        stroke="hsl(221, 83%, 53%)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(221, 83%, 53%)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 mx-auto opacity-50 mb-4" />
                      <p>No trend data available</p>
                      <p className="text-sm">Add pricing data to see trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competitor Distribution */}
            <Card data-testid="card-competitor-distribution">
              <CardHeader>
                <CardTitle>Competitor Data Distribution</CardTitle>
                <CardDescription>
                  Number of products tracked per competitor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {competitorsLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-64 rounded-full" />
                  </div>
                ) : competitorDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={competitorDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {competitorDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChartIcon className="h-16 w-16 mx-auto opacity-50 mb-4" />
                      <p>No competitor data available</p>
                      <p className="text-sm">Add competitors to see distribution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistical Summary */}
          <Card data-testid="card-statistical-summary">
            <CardHeader>
              <CardTitle>Statistical Summary</CardTitle>
              <CardDescription>
                Detailed statistical analysis of pricing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Central Tendency</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mean:</span>
                        <span className="font-medium" data-testid="stat-mean">${statistics.mean}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Median:</span>
                        <span className="font-medium" data-testid="stat-median">${statistics.median}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Variability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Std Deviation:</span>
                        <span className="font-medium" data-testid="stat-std-dev">${statistics.standardDeviation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="font-medium" data-testid="stat-range">
                          ${(parseFloat(statistics.max) - parseFloat(statistics.min)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Extremes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum:</span>
                        <span className="font-medium" data-testid="stat-min">${statistics.min}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maximum:</span>
                        <span className="font-medium" data-testid="stat-max">${statistics.max}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-16 w-16 mx-auto opacity-50 mb-4" />
                  <p>No statistical data available</p>
                  <p className="text-sm">Add pricing data to generate statistics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Performance Table */}
          <Card data-testid="card-competitor-performance">
            <CardHeader>
              <CardTitle>Competitor Performance Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of competitor metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competitorsData?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground">Competitor</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Avg Price</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Products</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Market Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorsData.map((competitor: any, index: number) => (
                        <tr key={competitor.id} className="border-b border-border/50" data-testid={`competitor-row-${index}`}>
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <span className="text-xs font-semibold text-accent-foreground">
                                  {competitor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </span>
                              </div>
                              <span className="font-medium text-foreground" data-testid={`competitor-name-${index}`}>
                                {competitor.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground" data-testid={`competitor-category-${index}`}>
                            {competitor.category}
                          </td>
                          <td className="p-3 font-medium text-foreground" data-testid={`competitor-avg-price-${index}`}>
                            ${competitor.avgPrice ? parseFloat(competitor.avgPrice).toFixed(2) : "N/A"}
                          </td>
                          <td className="p-3 text-muted-foreground" data-testid={`competitor-product-count-${index}`}>
                            {competitor.priceCount || 0}
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant={index < 3 ? "default" : "secondary"}
                              data-testid={`competitor-position-${index}`}
                            >
                              {index < 3 ? "High Activity" : "Moderate Activity"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto opacity-50 mb-4" />
                  <p>No competitor performance data available</p>
                  <p className="text-sm">Add competitors and pricing data to see analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
