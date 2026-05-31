import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI, loadFilteredDataFromAPI, postDataToAPI } from "../../services/api";
import { Plus, Search, Calendar, ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";
import type { StockMovement, Product } from "@/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";

interface MovementFormData {
  product: string;
  type: string;
  quantity: number;
}

export function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: "",
    type: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovementFormData>({
    defaultValues: { product: "", type: "", quantity: 0 },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchMovements = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value),
          );

          await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);

          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(
              ENDPOINTS.STOCK_MOVEMENTS,
              activeFilters,
              setMovements,
            );
          } else {
            await loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements);
          }
        } catch (error) {
          console.error("Error al cargar los movimientos de stock:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMovements();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const onSubmit = async (data: MovementFormData) => {
    try {
      await postDataToAPI(ENDPOINTS.STOCK_MOVEMENTS, {
        product: data.product,
        type: data.type,
        quantity: Number(data.quantity),
      });
      reset();
      setIsOpen(false);
      await loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements);
      toast.success("Movimiento de stock registrado exitosamente");
    } catch (error) {
      console.error("Error al registrar el movimiento de stock:", error);
      toast.error("Error al registrar el movimiento de stock");
    }
  };

  const getProductName = (productId: number): string =>
    products.find((p) => p.id === productId)?.name ?? "Producto no encontrado";

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Movimientos de Stock</h1>
          <p className="text-muted-foreground">
            Registra y consulta todas las entradas y salidas
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      {/* Create Movement Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          reset();
        }}
        title="Registrar Nuevo Movimiento"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Producto */}
          <div>
            <label
              htmlFor="movement-product"
              className="block text-sm font-medium mb-1.5"
            >
              Producto
            </label>
            <select
              id="movement-product"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...register("product", {
                required: "Selecciona un producto",
              })}
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product && (
              <p className="mt-1 text-sm text-destructive">
                {errors.product.message}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label
              htmlFor="movement-type"
              className="block text-sm font-medium mb-1.5"
            >
              Tipo de Movimiento
            </label>
            <select
              id="movement-type"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...register("type", {
                required: "Selecciona el tipo de movimiento",
              })}
            >
              <option value="">Selecciona un tipo de movimiento</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-destructive">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label
              htmlFor="movement-quantity"
              className="block text-sm font-medium mb-1.5"
            >
              Cantidad
            </label>
            <input
              id="movement-quantity"
              type="number"
              min={1}
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...register("quantity", {
                required: "La cantidad es requerida",
                min: { value: 1, message: "La cantidad debe ser mayor a 0" },
                valueAsNumber: true,
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
            >
              Cancelar
            </Button>
            <Button type="submit">Registrar Movimiento</Button>
          </div>
        </form>
      </Modal>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por producto o descripción..."
              value={filters.product}
              onChange={(e) =>
                setFilters({ ...filters, product: e.target.value })
              }
              className="w-full pl-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background sm:w-40"
          >
            <option value="">Todos los tipos</option>
            <option value="IN">Entradas</option>
            <option value="OUT">Salidas</option>
          </select>
        </div>
      </Card>

      {/* Movement List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : movements.length > 0 ? (
        <ul className="space-y-3">
          {movements.map((movement) => {
            const isIn = movement.type === "IN";
            return (
              <li key={movement.id}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {isIn ? (
                        <ArrowUpCircle className="h-5 w-5 text-chart-2 flex-shrink-0" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {getProductName(movement.product)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(movement.timestamp).toLocaleDateString(
                            "es-AR",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={
                          isIn
                            ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-2/10 text-chart-2"
                            : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                        }
                      >
                        {isIn ? "Entrada" : "Salida"}
                      </span>
                      <p className="mt-1 text-lg font-bold">
                        <span className={isIn ? "text-chart-2" : "text-destructive"}>
                          {isIn ? "+" : "−"}
                        </span>{" "}
                        {movement.quantity}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No se encontraron movimientos de stock.
          </p>
        </Card>
      )}
    </div>
  );
}
