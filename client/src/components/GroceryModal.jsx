import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';

const GROCERY_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry & Dry Goods',
  'Bakery',
  'Frozen Foods',
  'Beverages',
  'Spices & Seasonings',
  'Snacks',
  'Other'
];

const GroceryModal = ({
  isOpen,
  onClose,
  onSave,
  editingItem = null
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('Produce');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setQuantity(editingItem.quantity || '1');
      setUnit(editingItem.unit || 'pcs');
      setCategory(editingItem.category || 'Produce');
    } else {
      setName('');
      setQuantity('1');
      setUnit('pcs');
      setCategory('Produce');
    }
    setError('');
  }, [editingItem, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      quantity: quantity.trim() || '1',
      unit: unit.trim(),
      category
    };

    try {
      setSubmitting(true);
      await onSave(payload, editingItem?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save grocery item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '14px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: 'var(--primary-faint)',
              color: 'var(--primary-green)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>
                {editingItem ? 'Edit Grocery Item' : 'Add Grocery Item'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Item Name */}
          <div className="form-group">
            <label className="form-label">
              Item Name <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Extra Virgin Olive Oil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Quantity & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Quantity</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2, 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. bottles, kg, g, pcs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category / Department</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {GROCERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '18px'
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroceryModal;
