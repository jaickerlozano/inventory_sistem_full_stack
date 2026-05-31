import { useState, useEffect } from 'react';
import { Package, AlertTriangle, DollarSign, ShoppingCart, BarChart3, TrendingUp } from 'lucide-react';
import { ENDPOINTS } from '@/lib/utils';
import { loadDataFromAPI } from '../../services/api';
import type { Product, DashboardData } from '@/types';
import { Card } from '@/app/components/ui/Card';

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

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.DASHBOARD, setDashboardData),
          loadDataFromAPI(ENDPOINTS.LOW_STOCK_PRODUCTS, setLowStockProducts),
        ]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
  const totalMovements = lowStockProducts.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
              <p className="text-2xl font-bold">{totalMovements}</p>
            </Card>
          </div>

          {/* Charts placeholder — two cards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Movimiento de Stock</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Entradas vs Salidas — Últimos 6 meses</p>
              <div className="flex items-center justify-center h-48 bg-muted/50 rounded-md border border-border">
                <p className="text-muted-foreground text-sm">Gráfico disponible próximamente</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Tendencia de Movimientos</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Evolución Mensual</p>
              <div className="flex items-center justify-center h-48 bg-muted/50 rounded-md border border-border">
                <p className="text-muted-foreground text-sm">Gráfico disponible próximamente</p>
              </div>
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
                      <div className="text-right min-w-[120px]">
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
