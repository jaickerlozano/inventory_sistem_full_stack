import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { loadDataFromAPI } from '../../services/api';
import { ENDPOINTS } from '@/lib/utils';
import type { Category, AlertsResponse, AlertProduct } from '@/types';

const API_BASE_URL = 'http://localhost:8000/api/inventory';

// Mapeo de nivel de alerta a configuración visual
const ALERT_CONFIG = {
  CRITICAL: {
    label: 'Crítica',
    color: 'text-red-700 bg-red-100 border-red-300',
    icon: AlertTriangle,
  },
  HIGH: {
    label: 'Alta',
    color: 'text-orange-700 bg-orange-100 border-orange-300',
    icon: AlertCircle,
  },
  LOW: {
    label: 'Baja',
    color: 'text-yellow-700 bg-yellow-100 border-yellow-300',
    icon: Info,
  },
};

export function Alerts() {
  const [alerts, setAlerts] = useState<AlertsResponse>({
    products_with_alerts: [],
    critical_stock_products: [],
    high_stock_products: [],
    low_stock_products: [],
    total_critical_stock_products: 0,
    total_high_stock_products: 0,
    total_low_stock_products: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    alert: '',
    category: '',
  });

  // Defensive: ensure alerts always has the expected shape
  const productsWithAlerts = alerts?.products_with_alerts ?? [];
  const totalCritical = alerts?.total_critical_stock_products ?? 0;
  const totalHigh = alerts?.total_high_stock_products ?? 0;
  const totalLow = alerts?.total_low_stock_products ?? 0;

  // Carga categorías una sola vez
  useEffect(() => {
    loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
  }, []);

  // Carga alertas (con o sin filtros según corresponda)
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );

        let url = `${API_BASE_URL}${ENDPOINTS.ALERTS}/`;
        if (Object.keys(activeFilters).length > 0) {
          const params = new URLSearchParams(activeFilters);
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        // El backend devuelve un objeto, no un array — preservar estructura
        setAlerts(data);
      } catch (error) {
        console.error('Error al cargar las alertas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, [filters]);

  // Calcular stock percentage (para la barra visual)
  const getStockPercentage = (current: number, minimum: number): number => {
    if (minimum === 0) return 100;
    return Math.round((current / minimum) * 100);
  };

  // Renderizar tarjeta de resumen
  const SummaryCard = ({ title, count, description, config }: {
    title: string;
    count: number;
    description: string;
    config: { label: string; color: string; icon: ComponentType<{ size?: number }> };
  }) => {
    const Icon = config.icon;
    return (
      <div className={`p-4 rounded-lg border ${config.color}`}>
        <div className="flex items-center gap-2">
          <Icon size={20} />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-2xl font-bold mt-1">{count}</p>
        <p className="text-sm mt-1 opacity-80">{description}</p>
      </div>
    );
  };

  // Renderizar producto individual
  const ProductAlertItem = ({ product }: { product: AlertProduct }) => {
    const config = ALERT_CONFIG[product.alert_level] || ALERT_CONFIG.LOW;
    const Icon = config.icon;
    const percentage = getStockPercentage(product.current_stock, product.minimum_stock);

    return (
      <li className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          {/* Info principal */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={16} className={config.color.split(' ')[0]} />
              <h3 className="font-semibold">{product.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span>SKU: {product.sku || 'N/A'}</span>
              <span className="mx-2">·</span>
              <span>{product.category__name || 'Sin categoría'}</span>
            </div>
          </div>

          {/* Stock info */}
          <div className="text-right min-w-[140px]">
            <p className="text-sm">
              Stock: <strong>{product.current_stock}</strong> / Mín: {product.minimum_stock}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  percentage <= 30 ? 'bg-red-500' :
                  percentage <= 60 ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{percentage}% del mínimo</span>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Alertas de Stock</h1>
        <p className="text-gray-500">Productos que requieren atención inmediata</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Alertas Críticas"
          count={totalCritical}
          description="Stock agotado o requieren reposición inmediata"
          config={ALERT_CONFIG.CRITICAL}
        />
        <SummaryCard
          title="Alertas Altas"
          count={totalHigh}
          description="Requieren reposición pronto"
          config={ALERT_CONFIG.HIGH}
        />
        <SummaryCard
          title="Alertas Bajas"
          count={totalLow}
          description="Monitoreo preventivo"
          config={ALERT_CONFIG.LOW}
        />
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Filtros</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.alert}
            onChange={(e) => setFilters({ ...filters, alert: e.target.value })}
            className="px-3 py-2 border border-input rounded-md bg-input-background text-foreground"
          >
            <option value="">Todos los niveles</option>
            <option value="CRITICAL">Críticas</option>
            <option value="HIGH">Altas</option>
            <option value="LOW">Bajas</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-input rounded-md bg-input-background text-foreground"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Botón para limpiar filtros */}
          {(filters.alert || filters.category) && (
            <button
              onClick={() => setFilters({ alert: '', category: '' })}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de productos con alerta */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Productos con alerta
          {productsWithAlerts.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({productsWithAlerts.length} encontrado{productsWithAlerts.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {isLoading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : productsWithAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay productos con alertas{filters.alert || filters.category ? ' para los filtros seleccionados' : ''}.
          </p>
        ) : (
          <ul className="space-y-2">
            {productsWithAlerts.map((product) => (
              <ProductAlertItem key={product.id} product={product} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
