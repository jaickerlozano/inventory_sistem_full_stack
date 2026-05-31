import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { ChangeEvent } from "react";
import { ENDPOINTS } from "@/lib/utils";
import {
  loadDataFromAPI,
  loadFilteredDataFromAPI,
  postDataToAPI,
  putDataToFromAPI,
  deleteDataFromAPI,
} from "../../services/api";
import { Plus, Search, Trash, Edit, Box } from "lucide-react";
import type { Product, Category, Supplier } from "@/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  current_stock: number;
  minimum_stock: number;
  category: string;
  supplier: string;
  price: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState({
    name__icontains: "",
    category: "",
    supplier: "",
  });

  const createForm = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      current_stock: 0,
      minimum_stock: 0,
      category: "",
      supplier: "",
      price: "",
    },
  });

  const editForm = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      current_stock: 0,
      minimum_stock: 0,
      category: "",
      supplier: "",
      price: "",
    },
  });

  // Carga datos iniciales (categorías, proveedores)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories),
          loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers),
        ]);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Carga productos filtrados cuando los filtros cambian (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchProducts = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value),
          );

          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(
              ENDPOINTS.PRODUCTS,
              activeFilters,
              setProducts,
            );
          } else {
            await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
          }
        } catch (error) {
          console.error("Error cargando productos:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, name__icontains: e.target.value }));
  };

  const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleSupplierFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, supplier: e.target.value }));
  };

  const handleCreate = async (data: ProductFormData) => {
    try {
      await postDataToAPI(ENDPOINTS.PRODUCTS, {
        name: data.name,
        sku: data.sku || null,
        description: data.description || null,
        current_stock: data.current_stock,
        minimum_stock: data.minimum_stock,
        category: data.category || null,
        supplier: data.supplier || null,
        price: data.price,
      });
      createForm.reset();
      setIsCreateOpen(false);
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      toast.success("Producto agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error("Error al agregar el producto");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      sku: product.sku ?? "",
      description: product.description ?? "",
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      category: product.category ? product.category.toString() : "",
      supplier: product.supplier ? product.supplier.toString() : "",
      price: product.price,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;

    try {
      await putDataToFromAPI(`${ENDPOINTS.PRODUCTS}/${editingProduct.id}`, {
        name: data.name,
        sku: data.sku || null,
        description: data.description || null,
        current_stock: data.current_stock,
        minimum_stock: data.minimum_stock,
        category: data.category || null,
        supplier: data.supplier || null,
        price: data.price,
      });
      setEditingProduct(null);
      editForm.reset();
      setIsEditOpen(false);
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      toast.success("Producto actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDelete = async (productId: number) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar este producto?")
    ) {
      return;
    }

    try {
      await deleteDataFromAPI(`${ENDPOINTS.PRODUCTS}/${productId}`);
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      toast.success("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto");
    }
  };

  // Lookup maps para mostrar nombres en vez de IDs
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const supplierMap = useMemo(
    () => new Map(suppliers.map((s) => [s.id, s.name])),
    [suppliers],
  );

  // Determina el badge de stock según current_stock vs minimum_stock (3 niveles)
  const getStockBadge = (current: number, minimum: number) => {
    if (minimum === 0) {
      return {
        label: "OK",
        className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
        dot: "bg-chart-2",
      };
    }
    const ratio = current / minimum;
    if (ratio <= 0.3) {
      return {
        label: "Crítico",
        className: "bg-destructive/10 text-destructive border-destructive/20",
        dot: "bg-destructive",
      };
    }
    if (ratio <= 0.6) {
      return {
        label: "Alto",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
      };
    }
    if (current < minimum) {
      return {
        label: "Bajo",
        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
        dot: "bg-yellow-500",
      };
    }
    return {
      label: "OK",
      className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      dot: "bg-chart-2",
    };
  };

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Administra tu catálogo de productos e inventario
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          createForm.reset();
        }}
        title="Agregar Nuevo Producto"
      >
        <form
          onSubmit={createForm.handleSubmit(handleCreate)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Nombre del producto"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("name", {
                required: "El nombre del producto es obligatorio",
              })}
            />
            {createForm.formState.errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="product-sku"
              className="block text-sm font-medium mb-1.5"
            >
              SKU
            </label>
            <input
              id="product-sku"
              type="text"
              placeholder="SKU (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("sku")}
            />
          </div>
          <div>
            <label
              htmlFor="product-desc"
              className="block text-sm font-medium mb-1.5"
            >
              Descripción
            </label>
            <input
              id="product-desc"
              type="text"
              placeholder="Descripción (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("description")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product-stock"
                className="block text-sm font-medium mb-1.5"
              >
                Stock Actual
              </label>
              <input
                id="product-stock"
                type="number"
                placeholder="0"
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                {...createForm.register("current_stock", {
                  required: "El stock actual es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {createForm.formState.errors.current_stock && (
                <p className="mt-1 text-sm text-destructive">
                  {createForm.formState.errors.current_stock.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="product-min-stock"
                className="block text-sm font-medium mb-1.5"
              >
                Stock Mínimo
              </label>
              <input
                id="product-min-stock"
                type="number"
                placeholder="0"
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                {...createForm.register("minimum_stock", {
                  required: "El stock mínimo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {createForm.formState.errors.minimum_stock && (
                <p className="mt-1 text-sm text-destructive">
                  {createForm.formState.errors.minimum_stock.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="product-category"
              className="block text-sm font-medium mb-1.5"
            >
              Categoría
            </label>
            <select
              id="product-category"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("category")}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="product-supplier"
              className="block text-sm font-medium mb-1.5"
            >
              Proveedor
            </label>
            <select
              id="product-supplier"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("supplier")}
            >
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="product-price"
              className="block text-sm font-medium mb-1.5"
            >
              Precio
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("price", {
                required: "El precio es obligatorio",
              })}
            />
            {createForm.formState.errors.price && (
              <p className="mt-1 text-sm text-destructive">
                {createForm.formState.errors.price.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                createForm.reset();
              }}
              className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingProduct(null);
          editForm.reset();
        }}
        title="Editar Producto"
      >
        <form
          onSubmit={editForm.handleSubmit(handleEdit)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-product-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="edit-product-name"
              type="text"
              placeholder="Nombre del producto"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("name", {
                required: "El nombre del producto es obligatorio",
              })}
            />
            {editForm.formState.errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {editForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-product-sku"
              className="block text-sm font-medium mb-1.5"
            >
              SKU
            </label>
            <input
              id="edit-product-sku"
              type="text"
              placeholder="SKU (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("sku")}
            />
          </div>
          <div>
            <label
              htmlFor="edit-product-desc"
              className="block text-sm font-medium mb-1.5"
            >
              Descripción
            </label>
            <input
              id="edit-product-desc"
              type="text"
              placeholder="Descripción (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("description")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-product-stock"
                className="block text-sm font-medium mb-1.5"
              >
                Stock Actual
              </label>
              <input
                id="edit-product-stock"
                type="number"
                placeholder="0"
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                {...editForm.register("current_stock", {
                  required: "El stock actual es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {editForm.formState.errors.current_stock && (
                <p className="mt-1 text-sm text-destructive">
                  {editForm.formState.errors.current_stock.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="edit-product-min-stock"
                className="block text-sm font-medium mb-1.5"
              >
                Stock Mínimo
              </label>
              <input
                id="edit-product-min-stock"
                type="number"
                placeholder="0"
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                {...editForm.register("minimum_stock", {
                  required: "El stock mínimo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              {editForm.formState.errors.minimum_stock && (
                <p className="mt-1 text-sm text-destructive">
                  {editForm.formState.errors.minimum_stock.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="edit-product-category"
              className="block text-sm font-medium mb-1.5"
            >
              Categoría
            </label>
            <select
              id="edit-product-category"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("category")}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="edit-product-supplier"
              className="block text-sm font-medium mb-1.5"
            >
              Proveedor
            </label>
            <select
              id="edit-product-supplier"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("supplier")}
            >
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="edit-product-price"
              className="block text-sm font-medium mb-1.5"
            >
              Precio
            </label>
            <input
              id="edit-product-price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("price", {
                required: "El precio es obligatorio",
              })}
            />
            {editForm.formState.errors.price && (
              <p className="mt-1 text-sm text-destructive">
                {editForm.formState.errors.price.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsEditOpen(false);
                setEditingProduct(null);
                editForm.reset();
              }}
              className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filters.name__icontains}
              onChange={handleSearchChange}
              className="w-full pl-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>
          <select
            value={filters.category}
            onChange={handleCategoryFilterChange}
            className="w-full sm:w-48 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filters.supplier}
            onChange={handleSupplierFilterChange}
            className="w-full sm:w-48 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Product List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
              <div className="h-4 bg-muted rounded w-1/4" />
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const stockBadge = getStockBadge(
              product.current_stock,
              product.minimum_stock,
            );

            return (
              <Card
                key={product.id}
                className="p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {product.sku}
                      </p>
                    )}
                  </div>
                  {/* Stock badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${stockBadge.className}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${stockBadge.dot}`} />
                    {stockBadge.label}
                  </span>
                </div>

                {/* Stock detail */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums">
                      {product.current_stock}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / mín. {product.minimum_stock}
                    </span>
                  </div>
                  {product.current_stock <= product.minimum_stock && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠ Stock por debajo del mínimo
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-4 text-sm">
                  <p className="text-muted-foreground truncate">
                    <span className="font-medium">Categoría:</span>{" "}
                    {categoryMap.get(product.category) ?? "—"}
                  </p>
                  <p className="text-muted-foreground truncate">
                    <span className="font-medium">Proveedor:</span>{" "}
                    {supplierMap.get(product.supplier) ?? "—"}
                  </p>
                  <p className="text-muted-foreground truncate">
                    <span className="font-medium">Precio:</span> ${product.price}
                  </p>
                </div>

                {/* Row with description (if exists) and actions (always) */}
                <div className="mt-auto flex items-end justify-between gap-2 pt-3 border-t border-border">
                  {product.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1 min-w-0">
                      {product.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Box className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay productos disponibles.
          </p>
        </Card>
      )}
    </div>
  );
}
