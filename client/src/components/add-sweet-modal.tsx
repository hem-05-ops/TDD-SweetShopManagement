import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSweetSchema, InsertSweet, Sweet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

interface AddSweetModalProps {
  isVisible: boolean;
  onClose: () => void;
  sweet?: Sweet | null;
  onSuccess?: () => void; // made optional
}

export default function AddSweetModal({
  isVisible,
  onClose,
  sweet,
  onSuccess,
}: AddSweetModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSweet>({
    resolver: zodResolver(insertSweetSchema),
    defaultValues: {
      name: "",
      category: "mithai",
      description: "",
      price: "0",
      quantity: 0,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (sweet) {
      form.reset({
        name: sweet.name,
        category: sweet.category,
        description: sweet.description,
        price: sweet.price,
        quantity: sweet.quantity,
        imageUrl: sweet.imageUrl || "",
      });
    } else {
      form.reset({
        name: "",
        category: "mithai",
        description: "",
        price: "0",
        quantity: 0,
        imageUrl: "",
      });
    }
  }, [sweet, form]);

  const addSweetMutation = useMutation({
    mutationFn: async (data: InsertSweet) => {
      const url = sweet ? `/api/sweets/${sweet.id}` : "/api/sweets";
      const method = sweet ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      onSuccess?.(); // ✅ safe optional call
      onClose();
      form.reset();
      toast({
        title: sweet ? "Sweet updated successfully" : "Sweet added successfully",
        description: sweet
          ? "The sweet has been updated."
          : "The new sweet has been added to your inventory.",
      });
    },
    onError: (error: any) => {
      toast({
        title: sweet ? "Failed to update sweet" : "Failed to add sweet",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertSweet) => {
    addSweetMutation.mutate({
      ...data,
      price: data.price.toString(),
    });
  };

  const categories = [
    { value: "mithai", label: "Mithai" },
    { value: "laddu", label: "Laddu" },
    { value: "halwa", label: "Halwa" },
    { value: "barfi", label: "Barfi" },
  ];

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sweet ? "Edit Sweet" : "Add New Sweet"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Sweet Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter sweet name (e.g., Gulab Jamun)"
                data-testid="input-name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value as any)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price">
                Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                data-testid="input-price"
                {...form.register("price", {
                  setValueAs: (value) => value.toString(),
                })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">
                Initial Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                data-testid="input-quantity"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Enter a detailed description of the sweet..."
                data-testid="textarea-description"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSweetMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              data-testid="button-submit"
            >
              {addSweetMutation.isPending
                ? sweet
                  ? "Updating..."
                  : "Adding..."
                : sweet
                ? "Update Sweet"
                : "Add Sweet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
