import { useEffect, useState } from "react";
import { loadDataFromAPI, postDataToAPI, deleteDataFromAPI, putDataToFromAPI } from "../../services/api";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Plus, Search, Trash, X, Edit, Check } from "lucide-react";
import { ENDPOINTS } from "@/lib/utils";

export function Products() {
  const [products, setProducts] = useState([]); // Almacena la lista completa de productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Almacena la lista de productos filtrados según el término de búsqueda
  const [categories, setCategories] = useState([]); // Almacena la lista de categorías para el formulario
  const [suppliers, setSuppliers] = useState([]); // Almacena la lista de proveedores para el formulario
  const [isOpen, setIsOpen] = useState(false); // Controla la visibilidad del modal para agregar
  const [isLoading, setIsLoading] = useState(false); // Controla el estado de carga de los datos
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    current_stock: '',
    minimum_stock: '',
    category: '',
    supplier: '',
    price: '',
  }) // Almacena los datos del nuevo producto que se va a agregar o editar
  const [searchTerm, setSearchTerm] = useState(''); // Almacena el término de búsqueda para filtrar productos
  const [searchCategory, setSearchCategory] = useState(''); // Almacena la categoría seleccionada para filtrar productos
  const [searchSupplier, setSearchSupplier] = useState(''); // Almacena el proveedor seleccionado para filtrar productos
  const [editingProduct, setEditingProduct] = useState(null); // Almacena el producto que estamos editando
  const [isEditOpen, setIsEditOpen] = useState(false); // Controla la visibilidad del modal para editar los productos

  // Carga los productos, categorías y proveedores al montar el componente
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts),
          loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories),
          loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers),
        ]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filtra los productos según el término de búsqueda
  useEffect(() => {
    let filtered = products;

    // Filtro 1: Por término de búsqueda
    if (searchTerm !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.sku.toString().includes(searchTerm)
      );
    }

    // Filtro 2: Por categoría (se aplica DESPUÉS del primer filtro)
    if (searchCategory !== '') {
      filtered = filtered.filter(product => product.category === searchCategory);
    }

    // Filtro 3: Por proveedor (se aplica DESPUÉS del segundo filtro)
    if (searchSupplier !== '') {
      filtered = filtered.filter(product => product.supplier === searchSupplier);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, searchCategory, searchSupplier, products]);

  // Esta función se encarga de agregar un nuevo producto utilizando los datos del formulario
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
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      setFilteredProducts(products);
      alert("Producto agregado exitosamente!");
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      alert("Error al agregar el producto.");
    }
  }

  // Esta función se encarga de eliminar un producto dado su ID
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }
    console.log("Eliminando producto con ID:", productId);
    try {
      await deleteDataFromAPI(`${ENDPOINTS.PRODUCTS}/${productId}`);
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      setFilteredProducts(products);
      alert("Producto eliminado exitosamente!");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto.");  
    }
  }

  // Esta función se encarga de abrir el modal de edición y cargar los datos del producto seleccionado
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  }

  // Esta función se encarga de guardar los cambios después de editar un producto
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct.name || !editingProduct.current_stock || !editingProduct.minimum_stock) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    try {
      // Aquí se actualiza el producto en el backend
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

      // Recarga la lista de productos después de la edición
      await loadDataFromAPI(ENDPOINTS.PRODUCTS, setProducts);
      setIsOpen(false);
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

      {/* Barra de búsqueda */}
      <div>
          <h3>Filtrar productos</h3>
        <div>
          <input 
            type="text" placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={searchCategory.toString()}
            onChange={(e) => setSearchCategory(e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={searchSupplier}
            onChange={(e) => setSearchSupplier(e.target.value ? parseInt(e.target.value) : '')}
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
                type="text"
                placeholder="Stock actual..."
                value={editingProduct.current_stock}
                onChange={(e) => setEditingProduct({...editingProduct, current_stock: e.target.value})}
                required
              />
              <input
                type="text"
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
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
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
        <ul>
          {filteredProducts.map((product) => (
            <li 
              key={product.id}
              >
              Product: {product.name} / SKU: {product.sku} / Current Stock: {product.current_stock}
              <div>
                <button type="button" onClick={() => handleEditProduct(product)}
                ><Edit/></button>
                <button type="button" onClick={() => handleDeleteProduct(product.id)}><Trash /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}