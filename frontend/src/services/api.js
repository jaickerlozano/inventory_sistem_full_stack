const API_BASE_URL = "http://localhost:8000/api/inventory";

export const loadDataFromAPI = async (endpoint, setData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // Se preserva la estructura que viene del backend
    const processedData = data.results || data;
    setData(processedData);
  } catch (error) {
    console.error('Error al cargar:', error);
    throw error;
  }
}

// Nueva función para cargar con parámetros de filtro
export const loadFilteredDataFromAPI = async (endpoint, filters, setData) => {
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
    setData(arrayData);
  } catch (error) {
    console.error('Error al cargar datos filtrados:', error);
    throw error;
  }
} 

export const postDataToAPI = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al guardar:', error);
    throw error;
  }
}

export const putDataToFromAPI = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar:', error);
    throw error;
  }
}


export const deleteDataFromAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`, {
      method: "DELETE",
    });
    console.log(response)
    if(!response.ok)
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
}
