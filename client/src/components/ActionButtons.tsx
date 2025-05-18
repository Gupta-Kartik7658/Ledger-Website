import React from 'react';
import { Edit, Trash2, FileSpreadsheet } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  small?: boolean;
  withLabels?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  small = false,
  withLabels = false,
}) => {
  const baseClasses = `rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    small ? 'p-1' : 'p-2'
  }`;

  const editButtonClasses = `${baseClasses} text-blue-600 hover:bg-blue-100 focus:ring-blue-500`;
  const deleteButtonClasses = `${baseClasses} text-red-600 hover:bg-red-100 focus:ring-red-500`;

  return (
    <div className="flex space-x-2">
      <button
        type="button"
        className={editButtonClasses}
        onClick={onEdit}
        title="Edit"
      >
        <Edit className={small ? 'h-4 w-4' : 'h-5 w-5'} />
        {withLabels && <span className="ml-1">Edit</span>}
      </button>
      <button
        type="button"
        className={deleteButtonClasses}
        onClick={onDelete}
        title="Delete"
      >
        <Trash2 className={small ? 'h-4 w-4' : 'h-5 w-5'} />
        {withLabels && <span className="ml-1">Delete</span>}
      </button>
    </div>
  );
};

export const ExportButton: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = 'Export Excel',
}) => {
  return (
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      onClick={onClick}
    >
      <FileSpreadsheet className="h-4 w-4 mr-1" />
      {label}
    </button>
  );
};

export default ActionButtons;