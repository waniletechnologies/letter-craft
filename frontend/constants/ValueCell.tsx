import { useState, Edit, Save, X, Input, Button } from "@/lib/import";

export const ValueCell: React.FC<{
  value?: string;
  isEditable?: boolean;
  onEdit?: (newValue: string) => void;
}> = ({ value, isEditable = false, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    if (onEdit && editValue !== value) {
      onEdit(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditable && isEditing) {
    return (
      <div className="flex items-center gap-1 py-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-xs"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-6 w-6 p-0"
        >
          <Save className="h-3 w-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="py-2 flex items-center justify-between">
      <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524] flex-1">
        {value ?? ""}
      </div>
      {isEditable && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 ml-1"
        >
          <Edit className="h-3 w-3 text-gray-500" />
        </Button>
      )}
    </div>
  );
};
