import { useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function UploadDocument() {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Document uploaded (frontend only)");
  };

  return (
    <div className="max-w-lg">
      <Card>
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          {file && (
            <p className="text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}

          <Button type="submit">Upload</Button>
        </form>
      </Card>
    </div>
  );
}
