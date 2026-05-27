import React from 'react';
import { Plus, Search, Trash, X, Edit, Check} from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadFilteredDataFromAPI, loadDataFromAPI, postDataToAPI, putDataToFromAPI, deleteDataFromAPI} from '../../services/api';
import { ENDPOINTS } from '@/lib/utils';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name__icontains: '',
    contact__icontains: '',
    email__icontains: '',
  })
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleAddSupplier = async (e) => {
    e.preventDefault();

    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    try {
      await postDataToAPI(ENDPOINTS.SUPPLIERS, newSupplier);
      setNewSupplier({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
      });
      // Refrescar la lista de proveedores después de agregar uno nuevo
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      alert("Proveedor agregado exitosamente!");
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  }

  const handleEditSupplier = (supplier) => {
    setIsEditing(true);
    setEditingSupplier(supplier);
  };

  const handleSaveEditSupplier = async (e) => {
    e.preventDefault();

    if (!editingSupplier.name || !editingSupplier.contact || !editingSupplier.email) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    try {
      await putDataToFromAPI(`${ENDPOINTS.SUPPLIERS}/${editingSupplier.id}`, {
        name: editingSupplier.name,
        contact: editingSupplier.contact,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
      });
      setIsEditing(false);
      setEditingSupplier(null);
      // Refrescar la lista de proveedores después de editar uno
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      alert("Proveedor editado exitosamente!");
    } catch (error) {
      console.error('Error editing supplier:', error);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
      return;
    }

    try {
      await deleteDataFromAPI(`${ENDPOINTS.SUPPLIERS}/${supplierId}`);
      // Refrescar la lista de proveedores después de eliminar uno
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      alert("Proveedor eliminado exitosamente!");
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };  

  return (
    <div>
      <div>
        <div>
          <h1>Proveedores</h1>
          <p>Administra tus proveedores y contactos</p>
        </div>
        <div>
          <button onClick={() => setIsOpen(true)}>
            <Plus />
            Nuevo Proveedor
          </button>
          {isOpen && (
            <div>
              <h2>Agregar Nuevo Proveedor</h2>
              <form onSubmit={handleAddSupplier}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Contacto"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                />
                <button type="submit">
                  <Check />
                  Agregar Proveedor
                </button>
                <button type="button" onClick={() => setIsOpen(false)}>
                  <X />
                  Cancelar
                </button>
              </form>
            </div>
          )}
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

      { isEditing && editingSupplier && (
        <div>
          <h2>Editar Proveedor</h2>
          <form onSubmit={handleSaveEditSupplier}>
            <input
              type="text"
              placeholder="Nombre"
              value={editingSupplier.name}
              onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Contacto"
              value={editingSupplier.contact}
              onChange={(e) => setEditingSupplier({...editingSupplier, contact: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={editingSupplier.email}
              onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={editingSupplier.phone}
              onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
            />
            <input
              type="text"
              placeholder="Dirección"
              value={editingSupplier.address}
              onChange={(e) => setEditingSupplier({...editingSupplier, address: e.target.value})}
            />
            <button type="submit">
              <Check />
              Guardar Cambios
            </button>
            <button type="button" onClick={() => {
              setIsEditing(false);
            }}>
              <X />
              Cancelar
            </button>
          </form>
        </div>
      )}

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

              <button onClick={() => handleEditSupplier(supplier)}>
                <Edit />
                Editar
              </button>

              <button onClick={() => handleDeleteSupplier(supplier.id)}>
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