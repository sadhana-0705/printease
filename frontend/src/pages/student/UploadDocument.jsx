import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { uploadFile, getMyDocuments, deleteDocument } from "../../services/uploadService";
import { useNotification } from "../../hooks/useNotification";
import { buildFileUrl } from "../../config/api";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getMyDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      showNotification("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showNotification("Please select a file to upload", "error");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFile(file);
      showNotification(response.message || "Document uploaded successfully!", "success");
      setFile(null);
      await fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      showNotification(
        error.response?.data?.message || "Failed to upload document",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await deleteDocument(documentId);
      showNotification(response.message || "Document deleted successfully!", "success");
      await fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(
        error.response?.data?.message || "Failed to delete document",
        "error"
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT: UPLOAD FORM */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <p className="text-sm text-gray-600">
              Selected: {file.name} ({formatFileSize(file.size)})
            </p>
          )}

          <p className="text-xs text-gray-500">
            Supported formats: PDF, PPT, PPTX, DOC, DOCX (Max 10MB)
          </p>

          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </Card>

      {/* RIGHT: UPLOADED DOCUMENTS */}
      <Card>
        <h2 className="text-xl font-bold mb-4">My Uploaded Documents</h2>

        {loading ? (
          <p className="text-gray-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className={`p-3 border rounded-lg ${
                  doc.usedInOrder
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {doc.mimeType.split("/")[1]?.toUpperCase()}
                    </p>
                    {doc.usedInOrder ? (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        ⚠️ Used in order (cannot delete)
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        ✓ Available for use
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={buildFileUrl(doc.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      View
                    </a>
                    {!doc.usedInOrder && (
                      <button
                        onClick={() => handleDelete(doc._id, doc.originalName)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
