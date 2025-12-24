import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // Replace with your backend URL if different

// Fetch pengurus data
export const getPengurus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pengurus`, {
      params: { include: "m_gen" },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching pengurus data:", error);
    throw error;
  }
};

// Fetch berita data
export const getBerita = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/berita`);
    console.log("Berita response:", response);
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching berita data:", error);
    return [];
  }
};

// Fetch galery data
export const getGalery = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/galery`);
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching galery data:", error);
    throw error;
  }
};

// Fetch pengurus by ID
export const getPengurusById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dynamic/pengurus/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching pengurus by ID:", error);
    throw error;
  }
};

// Fetch berita by ID
export const getBeritaById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dynamic/berita/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching berita by ID:", error);
    throw error;
  }
};

// Fetch galery by ID
export const getGaleryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dynamic/galery/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching galery by ID:", error);
    throw error;
  }
};
