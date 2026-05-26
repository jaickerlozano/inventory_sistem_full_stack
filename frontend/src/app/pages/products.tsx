import { useEffect, useState } from "react";
import { loadDataFromAPI, loadFilteredDataFromAPI, postDataToAPI, deleteDataFromAPI, putDataToFromAPI } from "../../services/api";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Plus, Search, Trash, X, Edit, Check } from "lucide-react";
import { ENDPOINTS } from "@/lib/utils";

export function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    current_stock: '',
    minimum_stock: '',
    category: '',
    supplier: '',
    price: '',
  })
  
  // Filtros que se enviarán al backend
  const [filters, setFilters] = useState({
    name__icontains: '',
    category: '',
    supplier: '',
  });
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Carga datos iniciales (categorías, proveedores)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories),
          loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers),
        ]);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Carga productos filtrados cuando los filtros cambian
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Solo enviar filtros que tengan valor
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        await loadFilteredDataFromAPI(ENDPOINTS.PRODUCTS, activeFilters, setProducts);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  // Actualizar filtro de búsqueda por nombre
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      name__icontains: e.target.value, 
    });
  };

  // Actualizar filtro de categoría
  const handleCategoryChange = (e) => {
    setFilters({
      ...filters,
      category: e.target.value
    });
  };

  // Actualizar filtro de proveedor
  const handleSupplierChange = (e) => {
    setFilters({
      ...filters,
      supplier: e.target.value
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.current_stock || !newProduct.minimum_stock) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        sku: newProduct.sku || null,
        description: newProduct.description,
        current_stock: newProduct.current_stock,
        minimum_stock: newProduct.minimum_stock,
        category: newProduct.category,
        supplier: newProduct.supplier,
        price: newProduct.price,
      }

      await postDataToAPI(ENDPOINTS.PRODUCTS, payload);

      setNewProduct({
        name: '',
        sku: '',
        description: '',
        current_stock: '',
        minimum_stock: '',
        category: '',
        supplier: '',
        price: '',
      });
      
      // Recargar productos con los filtros actuales
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      await loadFilteredDataFromAPI(ENDPOINTS.PRODUCTS, activeFilters, setProducts);
      alert("Producto agregado exitosamente!");
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      alert("Error al agregar el producto.");
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }
    
    try {
      await deleteDataFromAPI(`${ENDPOINTS.PRODUCTS}/${productId}`);
      
      // Recargar productos con los filtros actuales
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      await loadFilteredDataFromAPI(ENDPOINTS.PRODUCTS, activeFilters, setProducts);
      alert("Producto eliminado exitosamente!");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto.");  
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  }

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct.name || !editingProduct.current_stock || !editingProduct.minimum_stock) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    try {
      await putDataToFromAPI(`${ENDPOINTS.PRODUCTS}/${editingProduct.id}`, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        description: editingProduct.description,
        current_stock: editingProduct.current_stock,
        minimum_stock: editingProduct.minimum_stock,
        category: editingProduct.category,
        supplier: editingProduct.supplier,
        price: editingProduct.price,
      });

      // Recargar productos con los filtros actuales
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      await loadFilteredDataFromAPI(ENDPOINTS.PRODUCTS, activeFilters, setProducts);
      setIsEditOpen(false);
      setEditingProduct(null);
      alert("Producto editado exitosamente!");
    } catch (error) {
      console.error("Error al editar el producto:", error);
      alert("Error al editar el producto.");
    }
  }

  return (
    <div>
      <h1>Product List</h1>
      <p>Welcome to the product list!</p>
      <div style={{ padding: '20px' }}>
        <button onClick={() => setIsOpen(true)}>Agregar Producto</button>

        {isOpen && (
          <div>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Button onClick={() => setIsOpen(false)}><X /></Button></div>
            <div>
              <form action="" onSubmit={(e) => {
                e.preventDefault();
                handleAddProduct(e);
                setIsOpen(false);
              }}>
                <input
                   type="text" placeholder="Nombre del producto..." 
                   value={newProduct.name}
                   onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                   required/>
                <input type="text" placeholder="SKU del producto..." 
                   value={newProduct.sku}
                   onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                />
                <input type="text" placeholder="Descripción del producto..." 
                   value={newProduct.description}
                   onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
                <input type="number" placeholder="Stock actual..." 
                   value={newProduct.current_stock}
                   onChange={(e) => setNewProduct({...newProduct, current_stock: e.target.value})}
                   required/>
                <input type="number" placeholder="Stock mínimo..." 
                   value={newProduct.minimum_stock}
                   onChange={(e) => setNewProduct({...newProduct, minimum_stock: e.target.value})}
                   required/>
                <select
                  value={newProduct.category ? newProduct.category.toString() : ''}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value ? parseInt(e.target.value) : ''})}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                >
                  <option value="">Selecciona un proveedor</option> 
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <input type="number" placeholder="Precio del producto..." 
                   value={newProduct.price}
                   onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                   required/>
                <button 
                  type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Guardar
                </button>
                <button
                  type="button" onClick={() => setIsOpen(false)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2">
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Barra de búsqueda - ahora envia los filtros al backend */}
      <div>
        <h3>Filtrar productos</h3>
        <div>
          <input 
            type="text" placeholder="Buscar por nombre..." 
            value={filters.name__icontains}
            onChange={handleSearchChange}
          />
          <select 
            value={filters.category__name__exact}
            onChange={handleCategoryChange}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filters.supplier__name__exact}
            onChange={handleSupplierChange}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2>Editar Producto</h2>
              <button onClick={() => setIsEditOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSaveEditProduct}>
              <input
                type="text"
                placeholder="Nombre del producto..."
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="SKU del producto..."
                value={editingProduct.sku}
                onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
              />
              <input
                type="text"
                placeholder="Descripción del producto..."
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Stock actual..."
                value={editingProduct.current_stock}
                onChange={(e) => setEditingProduct({...editingProduct, current_stock: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Stock mínimo..."
                value={editingProduct.minimum_stock}
                onChange={(e) => setEditingProduct({...editingProduct, minimum_stock: e.target.value})}
                required
              />
              <select
                value={editingProduct.category ? editingProduct.category.toString() : ''}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value ? parseInt(e.target.value) : ''})}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={editingProduct.supplier}
                onChange={(e) => setEditingProduct({...editingProduct, supplier: e.target.value})}
              >
                <option value="">Selecciona un proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Precio del producto..."
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                required
              />
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded ml-2"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      <div>
        <h2>Lista de productos</h2>
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                Product: {product.name} / SKU: {product.sku} / Current Stock: {product.current_stock}
                <div>
                  <button type="button" onClick={() => handleEditProduct(product)}>
                    <Edit/>
                  </button>
                  <button type="button" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}