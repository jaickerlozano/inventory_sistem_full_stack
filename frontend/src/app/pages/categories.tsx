import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/utils";
import { loadDataFromAPI } from "../../services/api";

export function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadDataFromAPI(ENDPOINTS.CATEGORIES, setCategories);
  }, []);

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