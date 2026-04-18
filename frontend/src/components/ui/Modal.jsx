import Button from "./Button";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {children}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <Button 
            onClick={onClose} 
            variant="secondary" 
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
