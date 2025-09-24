import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartLine } from "lucide-react";

export function PricingTrendChart() {
  const [timeframe, setTimeframe] = useState("30");
  
  const { data: trendData, isLoading } = useQuery({
    queryKey: ["/api/price-trends", { days: timeframe }],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, { days: string }];
      const searchParams = new URLSearchParams({ days: params.days });
      return fetch(`/api/price-trends?${searchParams}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Trends</CardTitle>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data for chart
  const processedData = trendData?.reduce((acc: any[], item: any) => {
    const date = new Date(item.date).toLocaleDateString();
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      existingEntry[`${item.competitor}-${item.product}`] = parseFloat(item.price);
    } else {
      acc.push({
        date,
        [`${item.competitor}-${item.product}`]: parseFloat(item.price),
      });
    }
    
    return acc;
  }, []) || [];

  const hasData = processedData.length > 0;

  return (
    <Card data-testid="card-pricing-trends">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Trends</CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32" data-testid="select-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground" 
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground" 
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              {Object.keys(processedData[0] || {})
                .filter(key => key !== "date")
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <ChartLine className="h-16 w-16 mx-auto opacity-50" />
              <p>No pricing data available for the selected timeframe</p>
              <p className="text-sm">Add competitor pricing data to see trends</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
