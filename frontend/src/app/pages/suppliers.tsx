import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ChangeEvent } from "react";
import { ENDPOINTS } from "@/lib/utils";
import {
  loadDataFromAPI,
  loadFilteredDataFromAPI,
  postDataToAPI,
  putDataToFromAPI,
  deleteDataFromAPI,
} from "../../services/api";
import { Plus, Search, Trash, Edit, Building } from "lucide-react";
import type { Supplier } from "@/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";

interface SupplierFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ name__icontains: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const createForm = useForm<SupplierFormData>({
    defaultValues: { name: "", contact: "", email: "", phone: "", address: "" },
  });

  const editForm = useForm<SupplierFormData>({
    defaultValues: { name: "", contact: "", email: "", phone: "", address: "" },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value),
          );

          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(
              ENDPOINTS.SUPPLIERS,
              activeFilters,
              setSuppliers,
            );
          } else {
            await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
          }
        } catch (error) {
          console.error("Error al cargar los proveedores:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSuppliers();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ name__icontains: e.target.value });
  };

  const handleCreate = async (data: SupplierFormData) => {
    try {
      await postDataToAPI(ENDPOINTS.SUPPLIERS, data);
      createForm.reset();
      setIsCreateOpen(false);
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      toast.success("Proveedor agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar proveedor:", error);
      toast.error("Error al agregar el proveedor");
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    editForm.reset({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (data: SupplierFormData) => {
    if (!editingSupplier) return;

    try {
      await putDataToFromAPI(
        `${ENDPOINTS.SUPPLIERS}/${editingSupplier.id}`,
        data,
      );
      setEditingSupplier(null);
      editForm.reset();
      setIsEditOpen(false);
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      toast.success("Proveedor actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      toast.error("Error al actualizar el proveedor");
    }
  };

  const handleDelete = async (supplierId: number) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")
    ) {
      return;
    }

    try {
      await deleteDataFromAPI(`${ENDPOINTS.SUPPLIERS}/${supplierId}`);
      await loadDataFromAPI(ENDPOINTS.SUPPLIERS, setSuppliers);
      toast.success("Proveedor eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      toast.error("Error al eliminar el proveedor");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground">
            Administra tus proveedores y contactos
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          createForm.reset();
        }}
        title="Agregar Nuevo Proveedor"
      >
        <form
          onSubmit={createForm.handleSubmit(handleCreate)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="supplier-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="supplier-name"
              type="text"
              placeholder="Nombre del proveedor"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("name", {
                required: "El nombre del proveedor es obligatorio",
              })}
            />
            {createForm.formState.errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="supplier-contact"
              className="block text-sm font-medium mb-1.5"
            >
              Contacto
            </label>
            <input
              id="supplier-contact"
              type="text"
              placeholder="Nombre de la persona de contacto"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("contact", {
                required: "El nombre del contacto es obligatorio",
              })}
            />
            {createForm.formState.errors.contact && (
              <p className="mt-1 text-sm text-destructive">
                {createForm.formState.errors.contact.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="supplier-email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="supplier-email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingresa un email válido",
                },
              })}
            />
            {createForm.formState.errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {createForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="supplier-phone"
              className="block text-sm font-medium mb-1.5"
            >
              Teléfono
            </label>
            <input
              id="supplier-phone"
              type="text"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("phone")}
            />
          </div>
          <div>
            <label
              htmlFor="supplier-address"
              className="block text-sm font-medium mb-1.5"
            >
              Dirección
            </label>
            <input
              id="supplier-address"
              type="text"
              placeholder="Dirección (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("address")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                createForm.reset();
              }}
              className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSupplier(null);
          editForm.reset();
        }}
        title="Editar Proveedor"
      >
        <form
          onSubmit={editForm.handleSubmit(handleEdit)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-supplier-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="edit-supplier-name"
              type="text"
              placeholder="Nombre del proveedor"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("name", {
                required: "El nombre del proveedor es obligatorio",
              })}
            />
            {editForm.formState.errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {editForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-supplier-contact"
              className="block text-sm font-medium mb-1.5"
            >
              Contacto
            </label>
            <input
              id="edit-supplier-contact"
              type="text"
              placeholder="Nombre de la persona de contacto"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("contact", {
                required: "El nombre del contacto es obligatorio",
              })}
            />
            {editForm.formState.errors.contact && (
              <p className="mt-1 text-sm text-destructive">
                {editForm.formState.errors.contact.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-supplier-email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="edit-supplier-email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingresa un email válido",
                },
              })}
            />
            {editForm.formState.errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {editForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="edit-supplier-phone"
              className="block text-sm font-medium mb-1.5"
            >
              Teléfono
            </label>
            <input
              id="edit-supplier-phone"
              type="text"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("phone")}
            />
          </div>
          <div>
            <label
              htmlFor="edit-supplier-address"
              className="block text-sm font-medium mb-1.5"
            >
              Dirección
            </label>
            <input
              id="edit-supplier-address"
              type="text"
              placeholder="Dirección (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("address")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsEditOpen(false);
                setEditingSupplier(null);
                editForm.reset();
              }}
              className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80"
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* Search Filter */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, contacto o email..."
            value={filters.name__icontains}
            onChange={handleSearchChange}
            className="w-full pl-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          />
        </div>
      </Card>

      {/* Supplier List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
              <div className="h-4 bg-muted rounded w-1/3" />
            </Card>
          ))}
        </div>
      ) : suppliers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {supplier.contact}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 mb-4 text-sm">
                {supplier.email && (
                  <p className="text-muted-foreground truncate">
                    {supplier.email}
                  </p>
                )}
                {supplier.phone && (
                  <p className="text-muted-foreground truncate">
                    {supplier.phone}
                  </p>
                )}
                {supplier.address && (
                  <p className="text-muted-foreground truncate">
                    {supplier.address}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Trash className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay proveedores disponibles.
          </p>
        </Card>
      )}
    </div>
  );
}
