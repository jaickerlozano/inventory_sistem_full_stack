import { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, DollarSign, ShoppingCart, BarChart3, TrendingUp } from 'lucide-react';
import { ENDPOINTS } from '@/lib/utils';
import { loadDataFromAPI } from '../../services/api';
import type { Product, DashboardData, StockMovement, BarChartData, LineChartData } from '@/types';
import { Card } from '@/app/components/ui/Card';
import { StockMovementBarChart, MovementTrendLineChart } from "../components/Graphics";

// ============================================================
// Helpers
// ============================================================

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
}

/** Nombres abreviados de meses en español */
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Procesa los movimientos de stock y los agrupa por mes.
 * Devuelve dos arrays: uno para el gráfico de barras y otro para el de línea.
 */
function processMovementsByMonth(movements: StockMovement[]): { barData: BarChartData[]; lineData: LineChartData[] } {
  // Mapa para acumular datos por mes: "YYYY-MM" -> { entries, exits, total }
  const monthlyMap = new Map<string, { entries: number; exits: number; total: number }>();

  for (const movement of movements) {
    const date = new Date(movement.timestamp);
    // Clave tipo "2024-01" para enero 2024
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { entries: 0, exits: 0, total: 0 });
    }

    const bucket = monthlyMap.get(monthKey)!;
    if (movement.type === 'IN') {
      bucket.entries += movement.quantity;
    } else if (movement.type === 'OUT') {
      bucket.exits += movement.quantity;
    }
    bucket.total += movement.quantity;
  }

  // Ordenar por mes (cronológico) y tomar los últimos 6 meses
  const sortedKeys = Array.from(monthlyMap.keys()).sort();
  const last6Keys = sortedKeys.slice(-6);

  const barData: BarChartData[] = [];
  const lineData: LineChartData[] = [];

  for (const key of last6Keys) {
    const [, monthStr] = key.split('-');
    const monthIndex = parseInt(monthStr, 10) - 1; // Convertir a índice 0-based
    const data = monthlyMap.get(key)!;

    barData.push({
      month: MONTH_NAMES[monthIndex],
      entries: data.entries,
      exits: data.exits,
    });

    lineData.push({
      month: MONTH_NAMES[monthIndex],
      total: data.total,
    });
  }

  return { barData, lineData };
}

// ============================================================
// Componente Dashboard
// ============================================================

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.DASHBOARD, setDashboardData),
          loadDataFromAPI(ENDPOINTS.LOW_STOCK_PRODUCTS, setLowStockProducts),
          loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements),
        ]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Procesar movimientos para los gráficos (se recalcula cuando cambian los movimientos)
  const { barData, lineData } = useMemo(
    () => processMovementsByMonth(movements),
    [movements]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del inventario</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasData = dashboardData.total_products !== undefined;

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del inventario</p>
      </div>

      {hasData ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total de productos</p>
              </div>
              <p className="text-2xl font-bold">{dashboardData.total_products}</p>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-muted-foreground">Stock bajo</p>
              </div>
              <p className="text-2xl font-bold">{dashboardData.low_stock_products}</p>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-5 w-5 text-chart-2" />
                <p className="text-sm text-muted-foreground">Valor del inventario</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(dashboardData.inventory_value)}</p>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-5 w-5 text-chart-1" />
                <p className="text-sm text-muted-foreground">Total de movimientos</p>
              </div>
              <p className="text-2xl font-bold">{movements.length}</p>
            </Card>
          </div>

          {/* Charts — dos cards lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de barras: Entradas vs Salidas */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Movimiento de Stock</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Entradas vs Salidas — Últimos 6 meses</p>
              <StockMovementBarChart data={barData} />
            </Card>

            {/* Gráfico de línea: Tendencia de movimientos */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Tendencia de Movimientos</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Evolución Mensual</p>
              <MovementTrendLineChart data={lineData} />
            </Card>
          </div>

          {/* Low stock products */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Productos con Bajo Stock
              {lowStockProducts.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({lowStockProducts.length} encontrado{lowStockProducts.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">Productos que requieren reposición urgente</p>

            {lowStockProducts.length > 0 ? (
              <ul className="space-y-2">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <h3 className="font-semibold">{product.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                      </div>
                      <div className="text-right min-w-[80px] sm:min-w-[120px]">
                        <p className="text-sm">
                          Stock: <strong>{product.current_stock}</strong> / Mín: {product.minimum_stock}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-card">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No hay productos con stock bajo</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudieron cargar los datos del dashboard.</p>
        </div>
      )}
    </div>
  );
}
