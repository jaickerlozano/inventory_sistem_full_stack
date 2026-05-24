import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI } from "../../services/api";

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        await loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();      
  }, []);

  // Nuevo useEffect que se ejecuta cuando categories cambia
  useEffect(() => {
    if (categories.length > 0) {
      console.log("Categorías cargadas:", categories);
    }
  }, [categories]);

  return (
    <div>
      <h1>Categories</h1>
      <p>Welcome to the categories page!</p>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}