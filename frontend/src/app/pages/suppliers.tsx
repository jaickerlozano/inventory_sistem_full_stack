import React from 'react';
import { Plus, Search, Trash, X, Edit, Check} from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadFilteredDataFromAPI, loadDataFromAPI } from '../../services/api';
import { ENDPOINTS } from '@/lib/utils';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name__icontains: '',
    contact__icontains: '',
    email__icontains: '',
  })

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        // Si hay algún filtro activo, usar la carga con filtros
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        );
        
        if (Object.keys(activeFilters).length > 0) {
          // Hay filtros activos, usa loadFilteredDataFromAPI
          await loadFilteredDataFromAPI(ENDPOINTS.SUPPLIERS, activeFilters, setSuppliers);
        } else {
          // Sin filtros, trae todos los datos
          await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [filters]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      name__icontains: e.target.value, 
    });
  };

  return (
    <div>
      <div>
        <div>
          <h1>Proveedores</h1>
          <p>Administra tus proveedores y contactos</p>
        </div>
        <div>
          <button>
            <Plus />
            Nuevo Proveedor
          </button>
        </div>
      </div>
      
      <div> 
        <h2>Buscar Proveedor</h2>
        <div> 
          <Search />
          <input 
            type="text" 
            placeholder="Buscar por nombre, contacto o email..." 
            value={filters.name__icontains}
            onChange={handleSearchChange}
          />
        </div>
      </div>

  <div>
    {isLoading ? (
      <p>Cargando proveedores...</p>
    ) : suppliers.length > 0 ? (
      suppliers.map((supplier) => (
        <div key={supplier.id}>
          <h3>{supplier.name}</h3>
          <p>Contacto: {supplier.contact}</p>
          <p>Email: {supplier.contact_email}</p>
          <p>Teléfono: {supplier.contact_phone}</p>

          <button>
            <Edit />
            Editar
          </button>

          <button>
            <Trash />
            Eliminar
          </button>
        </div>
      ))
    ) : (
      <p>No hay proveedores</p>
    )}
  </div>

    </div>
  );
}