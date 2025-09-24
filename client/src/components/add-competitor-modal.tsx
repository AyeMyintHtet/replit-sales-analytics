import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEntry?: any;
}

export function AddCompetitorModal({ isOpen, onClose, editingEntry }: AddCompetitorModalProps) {
  const [formData, setFormData] = useState({
    competitorId: "",
    productId: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const { toast } = useToast();

  const { data: competitors } = useQuery({
    queryKey: ["/api/competitors"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/competitor-pricing", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kpi"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/top-competitors"] });
      toast({
        title: "Success",
        description: editingEntry ? "Pricing entry updated successfully." : "Pricing entry added successfully.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save pricing entry.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      competitorId: "",
      productId: "",
      price: "",
      currency: "USD",
      notes: "",
    });
  };

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        competitorId: editingEntry.competitorId,
        productId: editingEntry.productId,
        price: editingEntry.price,
        currency: editingEntry.currency,
        notes: editingEntry.notes || "",
      });
    } else {
      resetForm();
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.competitorId || !formData.productId || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price).toFixed(2),
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-add-competitor">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Edit Competitor Data" : "Add Competitor Data"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor">Competitor *</Label>
            <Select 
              value={formData.competitorId} 
              onValueChange={(value) => setFormData({ ...formData, competitorId: value })}
              required
            >
              <SelectTrigger data-testid="select-competitor">
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
              value={formData.productId} 
              onValueChange={(value) => setFormData({ ...formData, productId: value })}
              required
            >
              <SelectTrigger data-testid="select-product">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                data-testid="input-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger data-testid="select-currency">
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
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="textarea-notes"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              data-testid="button-save"
            >
              {createMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
