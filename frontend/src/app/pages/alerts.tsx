import React from 'react';
import { Plus, Search, Trash, X, Edit, Check, ChevronDown} from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadFilteredDataFromAPI, loadDataFromAPI, postDataToAPI, putDataToFromAPI, deleteDataFromAPI} from '../../services/api';
import { ENDPOINTS } from '@/lib/utils';

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name__icontains: '',
    category: '',
    supplier: '',
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        await loadDataFromAPI(ENDPOINTS.ALERTS, setAlerts);
      } catch (error) {
        console.error('Error al cargar las alertas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [])


  return (
    <div>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <div>
            <div>
              <h1>Alertas de Stock</h1>
              <p>Productos que requieren atención inmediata</p>
            </div>
            <div>
              <div>
                <div>
                  <h3>Alertas Críticas</h3>
                  <p>{ alerts.total_critical_stock_products }</p> 
                  <p>Stock agotado o requieren reposición inmediatamente</p>
                </div>
                <div>
                  <h3>Alertas Altas</h3>
                  <p>{ alerts.total_high_stock_products } </p>
                  <p>Requieren reposición pronto</p>
                </div>
                <div>
                  <h3>Alertas Medias</h3>
                  <p>{ alerts.total_medium_stock_products } </p>
                  <p>Monitoreo preventivo</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <h3>Filtros</h3>
            </div>
            <div>
              <select name="" id="">
                <option value="">Todas las categorías</option>
                <option value="">Categoría 1</option>
                <option value="">Categoría 2</option>
                <option value="">Categoría 3</option>
              </select>
              <select name="" id="">
                <option value="">Todas las categorías</option>
              </select>
            </div>
          </div>

          <div>
            <ul>
              <li>
                <div>
                  <ChevronDown />
                </div>

                <div>
                  <header>
                    <div>
                      <h3>Nombre del producto</h3>  
                      <span>Alto</span>
                    </div>
                    <div>
                      <p>SKU</p>
                      <p>categoría</p>
                    </div>
                  </header>
                  <div>
                    <div>
                      <p>Stock actual: 3 / Mínimo: 10</p>
                      <span>30%</span> 
                    </div>
                    <p>barra de porcentaje</p>
                  </div>
                </div>

                <div>
                  <button>Reponer</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}