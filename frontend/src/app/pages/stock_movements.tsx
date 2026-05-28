import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI, loadFilteredDataFromAPI, postDataToAPI, putDataToFromAPI, deleteDataFromAPI} from "../../services/api";
import { Plus, Search, Trash, X, Edit, Check, Badge, Package, Calendar } from "lucide-react";

export function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: '', // Campo de búsqueda general que se envía a la API para filtrar por nombre o descripción
    type: '', // Campo para filtrar por tipo de movimiento (entrada/salida)
  });
  const [newMovement, setNewMovement] = useState({
    product: '',
    type: 'entry',
    quantity: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchMovements = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value)
          );
  
          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, activeFilters, setMovements);
          } else {
            await Promise.all([
              loadDataFromAPI(ENDPOINTS.STOCK_MOVEMENTS, setMovements),
              loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts),
            ]);            
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

  return (
    <div>
      <div>
        <div>
          <h1>Movimientos de Stock</h1>
          <p>Registra y consulta todas las entradas y salidas</p>
        </div>
        <div>
          <button>
            <Plus /> Registrar Movimiento
          </button>
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
                <div>
                  <Edit /> Editar
                  <Trash /> Eliminar
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