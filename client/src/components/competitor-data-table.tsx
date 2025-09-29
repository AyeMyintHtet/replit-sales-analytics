import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AddCompetitorModal } from "./add-competitor-modal";
// Import removed - using inline modal instead

export function CompetitorDataTable() {
  const [search, setSearch] = useState("");
  const [competitorFilter, setCompetitorFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const { toast } = useToast();

  const { data: pricingData, isLoading } = useQuery({
    queryKey: ["/api/competitor-pricing"],
  });

  const { data: competitors } = useQuery({
    queryKey: ["/api/competitors"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/competitor-pricing/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-pricing"] });
      toast({
        title: "Entry deleted",
        description: "Competitor pricing entry has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete competitor pricing entry.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this pricing entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "bg-destructive/10 text-destructive";
    if (change < 0) return "bg-chart-2/10 text-chart-2";
    return "bg-muted text-muted-foreground";
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Filter data based on search and filters
  const filteredData = (pricingData as any[])?.filter((entry: any) => {
    const matchesSearch = search === "" || 
      entry.competitor.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.product.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesCompetitor = competitorFilter === "" || entry.competitor.id === competitorFilter;
    const matchesProduct = productFilter === "" || entry.product.id === productFilter;
    
    return matchesSearch && matchesCompetitor && matchesProduct;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Pricing Updates</CardTitle>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card data-testid="card-competitor-data-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Pricing Updates</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search competitors, products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={competitorFilter} onValueChange={setCompetitorFilter}>
                <SelectTrigger className="w-40" data-testid="select-competitor-filter">
                  <SelectValue placeholder="All Competitors" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All Competitors</SelectItem> */}
                  {(competitors as any[])?.map((competitor: any) => (
                    <SelectItem key={competitor.id} value={competitor.id}>
                      {competitor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-40" data-testid="select-product-filter">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All Products</SelectItem> */}
                  {(products as any[])?.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleAddNew} data-testid="button-add-entry">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((entry: any, index: number) => (
                    <TableRow key={entry.id} data-testid={`row-entry-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <span className="text-xs font-semibold text-accent-foreground">
                              {entry.competitor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground" data-testid={`text-competitor-${index}`}>
                            {entry.competitor.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground" data-testid={`text-product-${index}`}>
                        {entry.product.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-foreground" data-testid={`text-price-${index}`}>
                          ${parseFloat(entry.price).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-updated-${index}`}>
                        {getTimeAgo(entry.updatedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-updated-by-${index}`}>
                        {entry.updatedByUser.fullName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            data-testid={`button-edit-${index}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            data-testid={`button-delete-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pricing data found</p>
              <p className="text-sm">Add competitor pricing data to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
      <AddCompetitorModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} editingEntry={editingEntry}/>
      {/* Modal functionality removed for simplicity */}
    </>
  );
}
