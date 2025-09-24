import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function CompetitorComparison() {
  const { data: competitors, isLoading } = useQuery({
    queryKey: ["/api/top-competitors", { limit: "3" }],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, { limit: string }];
      const searchParams = new URLSearchParams({ limit: params.limit });
      return fetch(`/api/top-competitors?${searchParams}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Competitors</CardTitle>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card data-testid="card-competitor-comparison">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Competitors</CardTitle>
          <Link href="/competitor-data">
            <Button variant="ghost" size="sm" data-testid="button-view-all">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitors?.length > 0 ? (
            competitors.map((competitor: any, index: number) => (
              <div key={competitor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`competitor-${index}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-accent-foreground" data-testid={`competitor-initials-${index}`}>
                      {getInitials(competitor.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid={`competitor-name-${index}`}>
                      {competitor.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`competitor-category-${index}`}>
                      {competitor.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground" data-testid={`competitor-price-${index}`}>
                    ${competitor.avgPrice ? parseFloat(competitor.avgPrice).toFixed(0) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`competitor-count-${index}`}>
                    {competitor.priceCount} products
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No competitors found</p>
              <p className="text-sm">Add competitors to see comparison data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
