import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Package, Building, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { selectIsCollapsed, useDataStore } from "@/store/useDataStore";

export default function AddData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isCollapsed = useDataStore(selectIsCollapsed)
  // Competitor form state
  const [competitorForm, setCompetitorForm] = useState({
    name: "",
    category: "",
    website: "",
    description: "",
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    description: "",
    ourPrice: "",
    currency: "USD",
  });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    competitorId: "",
    productId: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const { data: competitors } = useQuery({
    queryKey: ["/api/competitors"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  // Mutations
  const createCompetitorMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/competitors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      toast({
        title: "Success",
        description: "Competitor added successfully.",
      });
      setCompetitorForm({ name: "", category: "", website: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor.",
        variant: "destructive",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
      setProductForm({ name: "", category: "", description: "", ourPrice: "", currency: "USD" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product.",
        variant: "destructive",
      });
    },
  });

  const createPricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/competitor-pricing", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kpi"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-trends"] });
      toast({
        title: "Success",
        description: "Pricing data added successfully.",
      });
      setPricingForm({ competitorId: "", productId: "", price: "", currency: "USD", notes: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add pricing data.",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleCompetitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorForm.name || !competitorForm.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }
    createCompetitorMutation.mutate(competitorForm);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...productForm,
      ourPrice: productForm.ourPrice ? parseFloat(productForm.ourPrice).toFixed(2) : null,
    };
    createProductMutation.mutate(submitData);
  };

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingForm.competitorId || !pricingForm.productId || !pricingForm.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...pricingForm,
      price: parseFloat(pricingForm.price).toFixed(2),
    };
    createPricingMutation.mutate(submitData);
  };

  const canAddCompetitors = user?.role === "admin" || user?.role === "sales_manager";
  const canAddProducts = user?.role === "admin" || user?.role === "sales_manager";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className={cn("flex-1 flex flex-col overflow-hidden",isCollapsed ? 'ml-12' : 'ml-60')}>
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Add Data</h1>
              <p className="text-muted-foreground">Input new competitor, product, and pricing information</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="pricing" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pricing" data-testid="tab-pricing">Pricing Data</TabsTrigger>
              <TabsTrigger value="competitors" disabled={!canAddCompetitors} data-testid="tab-competitors">
                Competitors
              </TabsTrigger>
              <TabsTrigger value="products" disabled={!canAddProducts} data-testid="tab-products">
                Products
              </TabsTrigger>
            </TabsList>

            {/* Pricing Data Tab */}
            <TabsContent value="pricing">
              <Card data-testid="card-add-pricing">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Add Competitor Pricing
                  </CardTitle>
                  <CardDescription>
                    Enter pricing information for competitor products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePricingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="competitor">Competitor *</Label>
                        <Select 
                          value={pricingForm.competitorId} 
                          onValueChange={(value) => setPricingForm({ ...pricingForm, competitorId: value })}
                          required
                        >
                          <SelectTrigger data-testid="select-pricing-competitor">
                            <SelectValue placeholder="Select competitor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(competitors as any[])?.map((competitor: any) => (
                              <SelectItem key={competitor.id} value={competitor.id}>
                                {competitor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="product">Product *</Label>
                        <Select 
                          value={pricingForm.productId} 
                          onValueChange={(value) => setPricingForm({ ...pricingForm, productId: value })}
                          required
                        >
                          <SelectTrigger data-testid="select-pricing-product">
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(products as any[])?.map((product: any) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={pricingForm.price}
                          onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                          required
                          data-testid="input-pricing-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={pricingForm.currency} 
                          onValueChange={(value) => setPricingForm({ ...pricingForm, currency: value })}
                        >
                          <SelectTrigger data-testid="select-pricing-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        placeholder="Additional information about this pricing..."
                        value={pricingForm.notes}
                        onChange={(e) => setPricingForm({ ...pricingForm, notes: e.target.value })}
                        data-testid="textarea-pricing-notes"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createPricingMutation.isPending}
                      data-testid="button-add-pricing"
                    >
                      {createPricingMutation.isPending ? "Adding..." : "Add Pricing Data"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competitors Tab */}
            <TabsContent value="competitors">
              <Card data-testid="card-add-competitor">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Add New Competitor
                  </CardTitle>
                  <CardDescription>
                    Add a new competitor company to track their pricing data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCompetitorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="compName">Company Name *</Label>
                        <Input
                          id="compName"
                          value={competitorForm.name}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
                          placeholder="Enter company name"
                          required
                          data-testid="input-competitor-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="compCategory">Category *</Label>
                        <Input
                          id="compCategory"
                          value={competitorForm.category}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, category: e.target.value })}
                          placeholder="e.g., Technology, Software, Hardware"
                          required
                          data-testid="input-competitor-category"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="compWebsite">Website</Label>
                      <Input
                        id="compWebsite"
                        value={competitorForm.website}
                        onChange={(e) => setCompetitorForm({ ...competitorForm, website: e.target.value })}
                        placeholder="https://example.com"
                        type="url"
                        data-testid="input-competitor-website"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="compDescription">Description</Label>
                      <Textarea
                        id="compDescription"
                        rows={3}
                        value={competitorForm.description}
                        onChange={(e) => setCompetitorForm({ ...competitorForm, description: e.target.value })}
                        placeholder="Brief description of the competitor company..."
                        data-testid="textarea-competitor-description"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createCompetitorMutation.isPending}
                      data-testid="button-add-competitor"
                    >
                      {createCompetitorMutation.isPending ? "Adding..." : "Add Competitor"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card data-testid="card-add-product">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>
                    Add a new product to track across competitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prodName">Product Name *</Label>
                        <Input
                          id="prodName"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="Enter product name"
                          required
                          data-testid="input-product-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prodCategory">Category *</Label>
                        <Input
                          id="prodCategory"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="e.g., Software, Hardware, Service"
                          required
                          data-testid="input-product-category"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ourPrice">Our Price</Label>
                        <Input
                          id="ourPrice"
                          type="number"
                          step="0.01"
                          value={productForm.ourPrice}
                          onChange={(e) => setProductForm({ ...productForm, ourPrice: e.target.value })}
                          placeholder="0.00"
                          data-testid="input-product-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prodCurrency">Currency</Label>
                        <Select 
                          value={productForm.currency} 
                          onValueChange={(value) => setProductForm({ ...productForm, currency: value })}
                        >
                          <SelectTrigger data-testid="select-product-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prodDescription">Description</Label>
                      <Textarea
                        id="prodDescription"
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Detailed description of the product..."
                        data-testid="textarea-product-description"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createProductMutation.isPending}
                      data-testid="button-add-product"
                    >
                      {createProductMutation.isPending ? "Adding..." : "Add Product"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
