const API_BASE_URL = "http://localhost:8000/api/inventory";

export const loadDataFromAPI = async (endpoint, setData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error al cargar:', error);
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