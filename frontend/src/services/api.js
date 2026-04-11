import axios from "axios";

const API = axios.create({
  // baseURL: "http://127.0.0.1:8000",
  baseURL: "https://neurosentix.onrender.com",
});

export const analyzeText = async (text) => {
  const response = await API.post("/analyze", { text });
  return response.data;
};

export const fetchAllData = async () => {
  const response = await API.get("/all-data");
  return response.data;
};

// export const getWordCloud = () => {
//   return "http://127.0.0.1:8000/wordcloud";
// };


export const getWordCloud = async () => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/wordcloud`);
  return res;
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