import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI, loadFilteredDataFromAPI, postDataToAPI } from "../../services/api";
import { Plus, Search, X, Check, Calendar } from "lucide-react";
import type { StockMovement, Product } from '@/types';

export function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: '', // Campo de búsqueda general que se envía a la API para filtrar por nombre o descripción
    type: '', // Campo para filtrar por tipo de movimiento (entrada/salida)
  });
  const [newMovement, setNewMovement] = useState({
    product: '',
    type: '',
    quantity: 0,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchMovements = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value)
          );

          // Cargar productos para mostrar el nombre en lugar del ID en la lista de movimientos
          await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);

          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, activeFilters, setMovements);
          } else {
            await loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements);         
          }
        } catch (error) {
          console.error("Error al cargar los movimientos de stock:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovements();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleAddMovement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMovement.product || !newMovement.type || newMovement.quantity <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }
    
    try {
      await postDataToAPI(ENDPOINTS.STOCK_MOVEMENTS, newMovement);
      setNewMovement({
        product: '',
        type: '',
        quantity: 0,
      });
      setIsOpen(false);
      // Recargar movimientos después de agregar uno nuevo
      await loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements);
      alert('Movimiento de stock registrado exitosamente');
    } catch (error) {
      console.error("Error al registrar el movimiento de stock:", error);
    }
  }

  return (
    <div>
      <div>
        <div>
          <h1>Movimientos de Stock</h1>
          <p>Registra y consulta todas las entradas y salidas</p>
        </div>
        <div>
          <button onClick={() => setIsOpen(true)}>
            <Plus /> Registrar Movimiento
          </button>
          { isOpen && (
            <div>
              <div>
                <div>
                  <h2>{'Registrar Nuevo Movimiento'}</h2>
                  <p>Registra una entrada o salida de productos en el inventario</p>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddMovement}>
                <div> 
                  <label>Producto</label>
                  <select 
                    value={newMovement.product} 
                    onChange={(e) => setNewMovement({...newMovement, product: e.target.value })}>
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select> 
                </div>
                <div>
                  <label>Tipo de Movimiento</label>
                  <select 
                    value={newMovement.type} 
                    onChange={(e) => setNewMovement({...newMovement, type: e.target.value })}>
                    <option value="">Selecciona un tipo de movimiento</option>
                    <option value="IN">Entrada</option>
                    <option value="OUT">Salida</option>
                  </select>
                </div>
                <div>
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    value={newMovement.quantity} 
                    onChange={(e) => setNewMovement({...newMovement, quantity: parseInt(e.target.value) })} />
                </div>
                <button
                  type="button" onClick={() => setIsOpen(false)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2">
                  Cancelar
                </button>
                <button type="submit">
                  <Check /> Registrar Movimiento
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div>
        {/** Este bloque es para los filtros de búsqueda */}
        <div>
          <input
            type="text"
            placeholder="Buscar por producto o descripción..."
            value={filters.product}
            onChange={(e) => setFilters({...filters, product: e.target.value })}
          />
          <Search />
        </div>
      </div>

      <div>
        {/** Este bloque es para mostrar la lista de movimientos de stock */}
        {isLoading ? (
          <p>Cargando movimientos de stock...</p>
        ) : (
          movements.length > 0 ? (
            movements.map((movement) => (
              <div key={movement.id}>
                <div>
                  <Calendar /> { new Date(movement.timestamp).toLocaleDateString() } - {products.find((p) => p.id === movement.product)?.name || 'Producto no encontrado'} - {movement.type === 'IN' ? 'Entrada' : 'Salida'} - Cantidad: {movement.type === 'IN' ? '+' : '-'} {movement.quantity}
                </div>
              </div>
            ))
          ) : (
            <p>No se encontraron movimientos de stock.</p>
          )
        )}
      </div>
    </div>
  );
}