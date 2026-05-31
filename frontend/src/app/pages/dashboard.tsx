import { useState, useEffect } from 'react';
import { ENDPOINTS } from '@/lib/utils';
import { loadDataFromAPI } from '../../services/api';
import type { Product, DashboardData } from '@/types';

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

  useEffect(() => {
    console.log("Datos recibidos:", dashboardData);
    console.log("Datos recibidos:", lowStockProducts);
  }, [dashboardData, lowStockProducts]);

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <p>Resumen general del inventario</p>
      {isLoading ? (
        <p>Cargando datos...</p>
      ) : (
        <div>
          {dashboardData.total_products !== undefined ? (
            <div>
              <div>
                <p>Total de productos: {dashboardData.total_products}</p>
                <p>Productos con stock bajo: {dashboardData.low_stock_products}</p>
                <p>Valor del inventario: ${dashboardData.inventory_value}</p>
                <p>Movimientos: {lowStockProducts.length}</p>
              </div>
              <div>
                <div>
                  <h2>Movimiento de Stock</h2>
                  <p>Entradas vs Salidas - Últimos 6 meses</p>
                  <div>
                    <p>Aquí mostraré los datos con una gráfica</p>
                  </div>
                </div>
                <div>
                  <h2>Tendencia de Movimientos</h2>
                  <p>Evolución Mensual</p>
                  <div>
                    <p>Aquí mostraré los datos con una gráfica</p>
                  </div>
                </div>
              </div>
              <div>
                <h2>Productos con Bajo Stock</h2>
                <p>Productos que requieren reposición urgente</p>
                {lowStockProducts.length > 0 ? (
                  <ul>
                    {lowStockProducts.map((product) => (
                      <li key={product.id}>
                        {product.name} - Stock: {product.current_stock} (Mínimo: {product.minimum_stock})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay productos con stock bajo</p>
                )}
              </div>
            </div>
          ) : (
            <p>No se pudieron cargar los datos del dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}