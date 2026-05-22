import { useEffect, useState } from "react";
import { loadDataFromAPI, postDataToAPI, deleteDataFromAPI } from "../../services/api";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Plus, Search, Trash, X, Edit, Check } from "lucide-react";
import { ENDPOINTS } from "@/lib/utils";

export function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    setIsLoading(true);
    loadDataFromAPI(ENDPOINTS.PRODUCTS, (data) => {
      setProducts(data);
      setFilteredProducts(data); // Inicialmente muestra todos
    }).finally(() => setIsLoading(false));
    loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
    loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toString().includes(searchTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.current_stock || !newProduct.minimum_stock) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await postDataToAPI(ENDPOINTS.PRODUCTS, {
        name: newProduct.name,
        sku: newProduct.sku,
        description: newProduct.description,
        current_stock: newProduct.current_stock,
        minimum_stock: newProduct.minimum_stock,
        category: newProduct.category,
        supplier: newProduct.supplier,
        price: newProduct.price,
      });

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
                <input type="text" placeholder="Stock actual..." 
                   value={newProduct.current_stock}
                   onChange={(e) => setNewProduct({...newProduct, current_stock: e.target.value})}
                   required/>
                <input type="text" placeholder="Stock mínimo..." 
                   value={newProduct.minimum_stock}
                   onChange={(e) => setNewProduct({...newProduct, minimum_stock: e.target.value})}
                   required/>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
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
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Precio del producto..." 
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

      <div>
        <h3>Filtrar productos</h3>
        <input 
          type="text" placeholder="Buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <h2>Lista de productos</h2>
        <ul>
          {filteredProducts.map((product) => (
            <li 
              key={product.id}
              >
              Product: {product.name} / SKU: {product.sku} / Current Stock: {product.current_stock}
              <div>
                <button type="button"
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