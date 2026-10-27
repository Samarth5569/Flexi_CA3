import React from 'react';
import { Check, Edit3, Trash2 } from 'lucide-react';

const GroceryItemRow = ({
  item,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: item.isPurchased ? 'var(--bg-app)' : '#FFFFFF',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Checkbox and Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <button
          onClick={() => onToggleStatus(item)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            border: item.isPurchased ? 'none' : '2px solid var(--border-light)',
            backgroundColor: item.isPurchased ? 'var(--primary-green)' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={item.isPurchased ? 'Mark as pending' : 'Mark as purchased'}
        >
          {item.isPurchased && <Check size={16} strokeWidth={3} />}
        </button>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: item.isPurchased ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: item.isPurchased ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-light)' }}>
              {item.quantity} {item.unit}
            </span>
            <span className="badge badge-gray" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {item.category}
            </span>
          </div>
        </div>
      </div>

      {/* Row Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
        <button
          onClick={() => onEdit(item)}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)'
          }}
          title="Edit item"
        >
          <Edit3 size={15} />
        </button>
        <button
          onClick={() => onDelete(item)}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--status-danger)'
          }}
          title="Delete item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default GroceryItemRow;
