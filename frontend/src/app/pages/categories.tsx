import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI, loadFilteredDataFromAPI, postDataToAPI, putDataToFromAPI, deleteDataFromAPI} from "../../services/api";
import { Plus, Search, Trash, X, Edit, Check, Badge, Package } from "lucide-react";

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    name__icontains: '',
    description__icontains: '',
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState([]);

  useEffect(() => {
    // Se agrega un pequeño delay para evitar hacer demasiadas llamadas a la API mientras el usuario escribe en el campo de búsqueda
    const timer = setTimeout(() => {
      const fetchCategories = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value)
          );
  
          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(ENDPOINTS.CATEGORIES, activeFilters, setCategories);
          } else {
            await Promise.all([
              loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories),
              loadDataFromAPI(ENDPOINTS.TOTAL_PRODUCTS, setTotalProducts),
            ]);
          }
        } catch (error) {
          console.error("Error al cargar las categorías:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategories();      
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);
  
  // Nuevo useEffect que se ejecuta cuando categories cambia. Temporalmente para debuggear la carga de categorías y totalProducts
  useEffect(() => {
    if (categories.length > 0) {
      console.log("Categorías cargadas:", categories);
      console.log("Total de productos por categoría:", totalProducts);
      console.log('filtros actuales:', filters);
    }
  }, [categories]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      name__icontains: e.target.value, 
      description__icontains: e.target.value,
    });
    console.log(filters)
  };

  return (
    <div>
      <div>
        <div>
          <h1>Categories</h1>
          <p>Organiza tus productos por categorías</p>
        </div>
        <div>
          <button 
            onClick={() => setIsOpen(!isOpen)}>
            <Plus />
            Nueva Categoría
          </button>

          { isOpen && (
            <div>
              <h2>Nueva Categoría</h2>
              <form>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
                <button type="submit">
                  <Check />
                  Guardar
                </button>
              </form>
            </div>
          )}
        </div>  
      </div>

      <div>
        <div>
          <h3>Buscar Categoría</h3>
          <div> 
            <Search />
            <input 
              type="text" 
              placeholder="Buscar por nombre o descripción..." 
              value={filters.name__icontains}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            <p>Cargando categorías...</p>
          ) : (
            categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id}>
                  <div>
                    <div>
                      <Package /> 
                    </div>
                    <div>
                      <h4>{category.name}</h4>
                      <p>{totalProducts.find((tp) => tp.id === category.id)?.total_products || 0} productos</p>
                    </div>
                    <div>
                      <button onClick={() => {
                        setIsEditing(true);
                        setEditingCategory(category);
                      }}>
                        <Edit />
                        Editar
                      </button>
                      <button onClick={() => {
                        if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
                          deleteDataFromAPI(ENDPOINTS.CATEGORIES, category.id, () => {
                            setCategories(categories.filter(c => c.id !== category.id));
                          });
                        }
                      }}>
                        <Trash />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {isEditing && editingCategory && editingCategory.id === category.id && (
                    <div>
                      <h2>Editar Categoría</h2>
                      <form>
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        />
                        <input type="text"
                          placeholder="Descripción"
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                        />
                        <button type="submit">
                          <Check />
                          Guardar Cambios
                        </button>
                        <button type="button" onClick={() => {
                          setIsEditing(false);
                          setEditingCategory(null);
                        }}>
                          <X />
                          Cancelar
                        </button>
                      </form>
                    </div>
                  )}
                  <div>
                    <p> {category.description} </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay categorías disponibles.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}