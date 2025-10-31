import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit } from "lucide-react";

interface ActionMenuProps {
  batteryId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ActionMenu({ batteryId, onView, onEdit }: ActionMenuProps) {
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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Action menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView?.(batteryId));
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Logs
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit?.(batteryId));
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Update Battery Health
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

