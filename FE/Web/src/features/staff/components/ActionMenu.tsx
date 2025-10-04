import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";

interface ActionMenuProps {
  batteryId: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function ActionMenu({ batteryId, onEdit, onDelete, onView }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-button-primary/20 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-tertiary rounded-lg shadow-lg border border-border z-10">
          <div className="py-1">
            <button
              onClick={() => handleAction(() => onView?.(batteryId))}
              className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-button-primary hover:text-text-primary flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => handleAction(() => onEdit?.(batteryId))}
              className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-button-primary hover:text-text-primary flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleAction(() => onDelete?.(batteryId))}
              className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-red-600 hover:text-text-primary flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

