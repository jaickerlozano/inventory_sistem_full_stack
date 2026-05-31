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
import { Plus, Search, Trash, Edit, Package } from "lucide-react";
import type { Category, TotalProduct } from "@/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";

interface CategoryFormData {
  name: string;
  description: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [totalProducts, setTotalProducts] = useState<TotalProduct[]>([]);

  // Create form
  const createForm = useForm<CategoryFormData>({
    defaultValues: { name: "", description: "" },
  });

  // Edit form
  const editForm = useForm<CategoryFormData>({
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchCategories = async () => {
        setIsLoading(true);
        try {
          const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value),
          );

          if (Object.keys(activeFilters).length > 0) {
            await loadFilteredDataFromAPI(
              ENDPOINTS.CATEGORIES,
              activeFilters,
              setCategories,
            );
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCreate = async (data: CategoryFormData) => {
    try {
      await postDataToAPI(ENDPOINTS.CATEGORIES, data);
      createForm.reset();
      setIsCreateOpen(false);
      await loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
      toast.success("Categoría agregada exitosamente");
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      toast.error("Error al agregar la categoría");
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    try {
      await putDataToFromAPI(
        `${ENDPOINTS.CATEGORIES}/${editingCategory.id}`,
        data,
      );
      setEditingCategory(null);
      editForm.reset();
      setIsEditOpen(false);
      await loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
      toast.success("Categoría actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error("Error al actualizar la categoría");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")
    ) {
      return;
    }

    try {
      await deleteDataFromAPI(`${ENDPOINTS.CATEGORIES}/${categoryId}`);
      await loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
      toast.success("Categoría eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error("Error al eliminar la categoría");
    }
  };

  const getProductCount = (categoryId: number): number =>
    totalProducts.find((tp) => tp.id === categoryId)?.total_products ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">
            Organiza tus productos por categorías
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          createForm.reset();
        }}
        title="Nueva Categoría"
      >
        <form
          onSubmit={createForm.handleSubmit(handleCreate)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="category-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="Nombre de la categoría"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("name", {
                required: "El nombre de la categoría es obligatorio",
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
              htmlFor="category-desc"
              className="block text-sm font-medium mb-1.5"
            >
              Descripción
            </label>
            <input
              id="category-desc"
              type="text"
              placeholder="Descripción (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...createForm.register("description")}
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
          setEditingCategory(null);
          editForm.reset();
        }}
        title="Editar Categoría"
      >
        <form
          onSubmit={editForm.handleSubmit(handleEdit)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-category-name"
              className="block text-sm font-medium mb-1.5"
            >
              Nombre
            </label>
            <input
              id="edit-category-name"
              type="text"
              placeholder="Nombre de la categoría"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("name", {
                required: "El nombre de la categoría es obligatorio",
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
              htmlFor="edit-category-desc"
              className="block text-sm font-medium mb-1.5"
            >
              Descripción
            </label>
            <input
              id="edit-category-desc"
              type="text"
              placeholder="Descripción (opcional)"
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...editForm.register("description")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsEditOpen(false);
                setEditingCategory(null);
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
            placeholder="Buscar por nombre o descripción..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          />
        </div>
      </Card>

      {/* Category List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-2/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getProductCount(category.id)} producto
                    {getProductCount(category.id) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(category)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
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
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay categorías disponibles.
          </p>
        </Card>
      )}
    </div>
  );
}
