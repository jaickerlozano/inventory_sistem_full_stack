import { useState, useEffect } from 'react';
import { ENDPOINTS } from '@/lib/utils';
import { loadDataFromAPI } from '../../services/api';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await loadDataFromAPI(ENDPOINTS.DASHBOARD, setDashboardData);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setIsLoading(false);  
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Datos recibidos:", dashboardData);
  }, [dashboardData]);

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
                <p>Movimientos: {dashboardData.total_stock_movements}</p>
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
                <ul>
                  {/* {dashboardData.low_stock_products?.map((product: any) => (
                    <li key={product.id}>{product.name} - Stock: {product.stock}</li>
                  ))} */}
                </ul>
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