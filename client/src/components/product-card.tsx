import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sweet } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Eye, Edit, Plus, Trash2, Heart } from "lucide-react";

interface ProductCardProps {
  sweet: Sweet;
  isAdmin?: boolean;
}

export default function ProductCard({ sweet, isAdmin = false }: ProductCardProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cart", {
        sweetId: sweet.id,
        quantity: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${sweet.name} has been added to your cart.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sweets/${sweet.id}/purchase`, {
        quantity: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Purchase successful",
        description: `You have purchased ${sweet.name}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Unable to complete purchase",
        variant: "destructive",
      });
    },
  });

  const restockMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sweets/${sweet.id}/restock`, {
        quantity: restockQuantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      setIsRestockOpen(false);
      setRestockQuantity(1);
      toast({
        title: "Restock successful",
        description: `${sweet.name} has been restocked with ${restockQuantity} units.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Restock failed",
        description: error.message || "Unable to restock item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/sweets/${sweet.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Product deleted",
        description: `${sweet.name} has been removed from inventory.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Unable to delete item",
        variant: "destructive",
      });
    },
  });

  const getStockStatus = () => {
    if (sweet.quantity === 0) return { label: "Out of Stock", className: "status-out-of-stock" };
    if (sweet.quantity < 10) return { label: "Low Stock", className: "status-low-stock" };
    return { label: "In Stock", className: "status-in-stock" };
  };

  const stockStatus = getStockStatus();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make purchases.",
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        <img
          src={sweet.imageUrl || "https://via.placeholder.com/600x400?text=Sweet"}
          alt={sweet.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${stockStatus.className} text-xs`}>
            {stockStatus.label}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full h-auto w-auto"
          >
            <Heart size={16} />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-gray-900">{sweet.name}</h4>
          <Badge variant="secondary" className="text-xs">
            {sweet.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {sweet.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-primary">
            ₹{parseFloat(sweet.price).toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">
            <span>{sweet.quantity}</span> pieces available
          </div>
        </div>

        {/* Customer Actions */}
        {!isAdmin && (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button
                onClick={handleAddToCart}
                disabled={sweet.quantity === 0 || addToCartMutation.isPending}
                className="flex-1 bg-primary hover:bg-orange-600"
              >
                <ShoppingCart className="mr-2" size={16} />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Eye size={16} />
              </Button>
            </div>

  <Button
    onClick={handlePurchase}
    disabled={sweet.quantity === 0 || purchaseMutation.isPending}
    className="w-full bg-green-600 hover:bg-green-700"
  >
    {purchaseMutation.isPending ? "Purchasing..." : "Buy Now"}
  </Button>
</div>

        )}

        {/* Admin Actions */}
        {isAdmin && user?.role === "admin" && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                onClick={handlePurchase}
                disabled={sweet.quantity === 0 || purchaseMutation.isPending}
                className="flex-1 bg-primary hover:bg-orange-600"
                size="sm"
              >
                <ShoppingCart className="mr-2" size={14} />
                {purchaseMutation.isPending ? "Processing..." : "Test Purchase"}
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Eye size={14} />
              </Button>
            </div>
            
            <div className="flex space-x-2 text-sm">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-1 h-auto">
                <Edit className="mr-1" size={14} />
                Edit
              </Button>
              
              <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800 p-1 h-auto">
                    <Plus className="mr-1" size={14} />
                    Restock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Restock {sweet.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quantity">Quantity to add</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={restockQuantity}
                        onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => restockMutation.mutate()}
                        disabled={restockMutation.isPending}
                        className="flex-1"
                      >
                        {restockMutation.isPending ? "Restocking..." : "Restock"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsRestockOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="text-red-600 hover:text-red-800 p-1 h-auto"
              >
                <Trash2 className="mr-1" size={14} />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
