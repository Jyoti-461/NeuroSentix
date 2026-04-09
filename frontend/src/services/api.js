import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const analyzeText = async (text) => {
  const response = await API.post("/analyze", { text });
  return response.data;
};

export const fetchAllData = async () => {
  const response = await API.get("/all-data");
  return response.data;
};
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/upload-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};