import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { CompetitorDataTable } from "@/components/competitor-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { selectIsCollapsed, useDataStore } from "@/store/useDataStore";
import { cn } from "@/lib/utils";
import { AddCompetitorModal } from "@/components/add-competitor-modal";

export default function CompetitorData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isCollapsed = useDataStore(selectIsCollapsed)
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    category: "",
    website: "",
    description: "",
  });
  const { data: competitors } = useQuery({
    queryKey: ["/api/competitors"],
  });

  const createCompetitorMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/competitors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/top-competitors"] });
      toast({
        title: "Success",
        description: "Competitor added successfully.",
      });
      setNewCompetitor({ name: "", category: "", website: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor.",
        variant: "destructive",
      });
    },
  });

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitor.name || !newCompetitor.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }
    createCompetitorMutation.mutate(newCompetitor);
  };

  const canAddCompetitors = user?.role === "admin" || user?.role === "sales_manager";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className={cn("flex-1 flex flex-col overflow-hidden",isCollapsed ? 'ml-12' : 'ml-60')}>
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Competitor Data</h1>
              <p className="text-muted-foreground">Manage competitor information and pricing data</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Competitor Form */}
          {canAddCompetitors && (
            <Card data-testid="card-add-competitor">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Competitor
                </CardTitle>
                <CardDescription>
                  Add a new competitor to track their pricing data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCompetitor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={newCompetitor.name}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                      placeholder="Enter company name"
                      required
                      data-testid="input-competitor-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={newCompetitor.category}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, category: e.target.value })}
                      placeholder="e.g., Technology, Software, Hardware"
                      required
                      data-testid="input-competitor-category"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newCompetitor.website}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                      placeholder="https://example.com"
                      type="url"
                      data-testid="input-competitor-website"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newCompetitor.description}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                      placeholder="Brief description of the competitor"
                      data-testid="input-competitor-description"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Button 
                      type="submit" 
                      disabled={createCompetitorMutation.isPending}
                      data-testid="button-add-competitor"
                    >
                      {createCompetitorMutation.isPending ? "Adding..." : "Add Competitor"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Competitors */}
          <Card data-testid="card-existing-competitors">
            <CardHeader>
              <CardTitle>Tracked Competitors</CardTitle>
              <CardDescription>
                Currently tracking {(competitors as any[])?.length || 0} competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(competitors as any[])?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(competitors as any[]).map((competitor: any, index: number) => (
                    <div 
                      key={competitor.id} 
                      className="p-4 border border-border rounded-lg" 
                      data-testid={`competitor-card-${index}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent-foreground">
                            {competitor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate" data-testid={`competitor-name-${index}`}>
                            {competitor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`competitor-category-${index}`}>
                            {competitor.category}
                          </p>
                          {competitor.website && (
                            <a 
                              href={competitor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                              data-testid={`competitor-website-${index}`}
                            >
                              Visit Website
                            </a>
                          )}
                          {competitor.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2" data-testid={`competitor-description-${index}`}>
                              {competitor.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No competitors found</p>
                  {canAddCompetitors && (
                    <p className="text-sm">Add your first competitor above to get started</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Data Table */}
          <CompetitorDataTable />
         
        </main>
      </div>
    </div>
  );
}
