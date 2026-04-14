import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, PackagePlus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type CustomProduct,
  deleteCustomProduct,
  getCustomProducts,
  getOverrides,
  saveCustomProduct,
  saveOverride,
} from "../data/localProducts";
import { STATIC_PRODUCTS } from "../data/staticProducts";

const PIN = "pearl";

type EditState = {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
  inStock: boolean;
  imageUrl: string;
  isCustom: boolean;
};

function toEditState(id: string): EditState {
  const overrides = getOverrides();
  const custom = getCustomProducts().find((p) => p.id === id);
  if (custom) {
    return {
      id,
      name: custom.name,
      price: String(custom.price),
      description: custom.description,
      category: custom.category,
      inStock: custom.inStock,
      imageUrl: custom.imageUrl,
      isCustom: true,
    };
  }
  const sp = STATIC_PRODUCTS.find((p) => p.id === id)!;
  const o = overrides[id] ?? {};
  return {
    id,
    name: o.name ?? sp.name,
    price: String(o.price ?? sp.price),
    description: o.description ?? sp.description,
    category: o.category ?? sp.category,
    inStock: o.inStock !== undefined ? o.inStock : sp.inStock,
    imageUrl: sp.imageUrl.getDirectURL(),
    isCustom: false,
  };
}

function blankNew(): EditState {
  return {
    id: "",
    name: "",
    price: "",
    description: "",
    category: "Bracelets",
    inStock: true,
    imageUrl: "",
    isCustom: true,
  };
}

function getAllProducts() {
  return [
    ...STATIC_PRODUCTS.map((sp) => toEditState(sp.id)),
    ...getCustomProducts().map((cp) => toEditState(cp.id)),
  ];
}

export function ManageProductsPage() {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [editing, setEditing] = useState<EditState | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newState, setNewState] = useState<EditState>(blankNew);
  const [products, setProducts] = useState<EditState[]>(getAllProducts);

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleUnlock = () => {
    if (pin.toLowerCase() === PIN) {
      setUnlocked(true);
      setPinError(false);
      setProducts(getAllProducts());
    } else {
      setPinError(true);
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    const price = Number.parseFloat(editing.price);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Enter a valid price.");
      return;
    }
    if (editing.isCustom) {
      saveCustomProduct({
        id: editing.id,
        name: editing.name,
        price,
        description: editing.description,
        category: editing.category,
        inStock: editing.inStock,
        imageUrl: editing.imageUrl,
      });
    } else {
      saveOverride({
        id: editing.id,
        name: editing.name,
        price,
        description: editing.description,
        category: editing.category,
        inStock: editing.inStock,
      });
    }
    setEditing(null);
    setProducts(getAllProducts());
    invalidateProducts();
    toast.success("Product updated!");
  };

  const saveNew = () => {
    const price = Number.parseFloat(newState.price);
    if (!newState.name.trim()) {
      toast.error("Enter a product name.");
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Enter a valid price.");
      return;
    }
    if (!newState.imageUrl.trim()) {
      toast.error("Enter an image URL.");
      return;
    }
    const id = `local-${Date.now()}`;
    const cp: CustomProduct = {
      id,
      name: newState.name,
      price,
      description: newState.description,
      category: newState.category,
      inStock: newState.inStock,
      imageUrl: newState.imageUrl,
    };
    saveCustomProduct(cp);
    setAddingNew(false);
    setNewState(blankNew());
    setProducts(getAllProducts());
    invalidateProducts();
    toast.success("Product added!");
  };

  const removeCustom = (id: string) => {
    deleteCustomProduct(id);
    setProducts(getAllProducts());
    invalidateProducts();
    toast.success("Product removed.");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-soft p-8 max-w-sm w-full text-center">
          <h1 className="font-display text-2xl font-medium text-foreground mb-2">
            Product Manager
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Enter your PIN to manage products and prices.
          </p>
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            className="rounded-xl font-body mb-3"
            data-ocid="manage.input"
          />
          {pinError && (
            <p
              className="text-xs text-destructive font-body mb-3"
              data-ocid="manage.error_state"
            >
              Incorrect PIN. Try again.
            </p>
          )}
          <Button
            onClick={handleUnlock}
            className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
            data-ocid="manage.primary_button"
          >
            Unlock
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="py-10 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Manage Products
            </h1>
            <p className="font-body text-muted-foreground text-sm mt-1">
              Edit names, prices, and add new products. Changes save instantly.
            </p>
          </div>
          {!addingNew && (
            <Button
              onClick={() => {
                setAddingNew(true);
                setNewState(blankNew());
              }}
              className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              data-ocid="manage.primary_button"
            >
              <PackagePlus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {/* Add new product form */}
        {addingNew && (
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-primary/20">
            <h2 className="font-display text-lg font-medium mb-5">
              New Product
            </h2>
            <ProductEditForm
              state={newState}
              onChange={setNewState}
              showImageUrl
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={saveNew}
                className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                data-ocid="manage.save_button"
              >
                <Save className="mr-2 h-4 w-4" /> Save Product
              </Button>
              <Button
                variant="outline"
                onClick={() => setAddingNew(false)}
                className="font-body rounded-xl"
                data-ocid="manage.cancel_button"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing products */}
        {products.map((p, i) => (
          <div
            key={p.id}
            className="bg-card rounded-2xl shadow-soft overflow-hidden"
            data-ocid={`manage.item.${i + 1}`}
          >
            {editing?.id === p.id ? (
              <div className="p-6">
                <h3 className="font-display text-base font-medium mb-5">
                  Editing: {p.name}
                </h3>
                <ProductEditForm
                  state={editing}
                  onChange={setEditing as (s: EditState) => void}
                  showImageUrl={p.isCustom}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={saveEdit}
                    className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                    data-ocid={`manage.save_button.${i + 1}`}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(null)}
                    className="font-body rounded-xl"
                    data-ocid={`manage.cancel_button.${i + 1}`}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-center p-5">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {p.category} &middot;{" "}
                    <span className="font-semibold text-foreground">
                      &#8377;{Number(p.price).toLocaleString("en-IN")}
                    </span>
                  </p>
                  <Badge
                    variant={p.inStock ? "outline" : "secondary"}
                    className="font-body text-xs mt-1"
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(toEditState(p.id))}
                    data-ocid={`manage.edit_button.${i + 1}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {p.isCustom && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustom(p.id)}
                      data-ocid={`manage.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function ProductEditForm({
  state,
  onChange,
  showImageUrl,
}: {
  state: EditState;
  onChange: (s: EditState) => void;
  showImageUrl?: boolean;
}) {
  const set = (key: keyof EditState, val: string | boolean) =>
    onChange({ ...state, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-sm mb-1.5 block">Product Name</Label>
          <Input
            value={state.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Pearl Drop Necklace"
            className="rounded-xl font-body"
            data-ocid="manage.input"
          />
        </div>
        <div>
          <Label className="font-body text-sm mb-1.5 block">
            Price (&#8377;)
          </Label>
          <Input
            value={state.price}
            onChange={(e) => set("price", e.target.value)}
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 299"
            className="rounded-xl font-body"
            data-ocid="manage.input"
          />
        </div>
      </div>
      <div>
        <Label className="font-body text-sm mb-1.5 block">Category</Label>
        <Input
          value={state.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="e.g. Bracelets"
          className="rounded-xl font-body"
          data-ocid="manage.input"
        />
      </div>
      <div>
        <Label className="font-body text-sm mb-1.5 block">Description</Label>
        <Textarea
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the product..."
          className="rounded-xl font-body"
          data-ocid="manage.textarea"
        />
      </div>
      {showImageUrl && (
        <div>
          <Label className="font-body text-sm mb-1.5 block">Image URL</Label>
          <Input
            value={state.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://... or /assets/uploads/..."
            className="rounded-xl font-body"
            data-ocid="manage.input"
          />
          {state.imageUrl && (
            <img
              src={state.imageUrl}
              alt="preview"
              className="mt-2 w-20 h-20 rounded-xl object-cover"
            />
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="instock-edit"
          checked={state.inStock}
          onChange={(e) => set("inStock", e.target.checked)}
          data-ocid="manage.checkbox"
        />
        <Label htmlFor="instock-edit" className="font-body text-sm">
          In Stock
        </Label>
      </div>
    </div>
  );
}
