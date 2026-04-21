import api from "./api";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
};

export const getMyDocuments = async () => {
  const res = await api.get("/upload/my");
  return res.data;
};

export const deleteDocument = async (documentId) => {
  const res = await api.delete(`/upload/${documentId}`);
  return res.data;
};
