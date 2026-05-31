const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/inventory";

type SetData<T> = (data: T) => void;

export const loadDataFromAPI = async <T>(endpoint: string, setData: SetData<T>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // Se preserva la estructura que viene del backend
    const processedData = data.results || data;
    setData(processedData as T);
  } catch (error) {
    console.error('Error al cargar:', error);
    throw error;
  }
};

// Nueva función para cargar con parámetros de filtro
export const loadFilteredDataFromAPI = async <T>(
  endpoint: string,
  filters: Record<string, string>,
  setData: SetData<T>,
): Promise<void> => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    const url = `${API_BASE_URL}${endpoint}/?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const arrayData = data.results ? data.results : Array.isArray(data) ? data : [];
    setData(arrayData as T);
  } catch (error) {
    console.error('Error al cargar datos filtrados:', error);
    throw error;
  }
};

export const postDataToAPI = async <T>(endpoint: string, data: unknown): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error('Error al guardar:', error);
    throw error;
  }
};

export const putDataToFromAPI = async <T>(endpoint: string, data: unknown): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error('Error al actualizar:', error);
    throw error;
  }
};

export const deleteDataFromAPI = async (endpoint: string): Promise<unknown> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    // DELETE may return 204 No Content
    if (response.status === 204) {
      return;
    }
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar:', error);
    throw error;
  }
};
