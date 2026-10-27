import React, { useState, useEffect } from 'react';
import { groceryAPI } from '../services/api';
import GroceryItemRow from '../components/GroceryItemRow';
import GroceryModal from '../components/GroceryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

const GROCERY_CATEGORIES = [
  'All',
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

const GroceryPage = () => {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, purchased: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, purchased
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Deletion confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isBulkClear, setIsBulkClear] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        status: statusFilter,
        category: categoryFilter,
        search
      };
      const res = await groceryAPI.getGroceryItems(params);
      if (res && res.data) {
        setItems(res.data);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load grocery items:', err);
      setError(err.message || 'Unable to fetch grocery list from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, categoryFilter, search]);

  const handleSaveItem = async (payload, itemId) => {
    if (itemId) {
      await groceryAPI.updateGroceryItem(itemId, payload);
    } else {
      await groceryAPI.createGroceryItem(payload);
    }
    await fetchItems();
  };

  const handleToggleStatus = async (item) => {
    // Optimistic local state update
    const newStatus = !item.isPurchased;
    setItems((prev) =>
      prev.map((it) => (it._id === item._id ? { ...it, isPurchased: newStatus } : it))
    );
    setCounts((prev) => ({
      ...prev,
      pending: newStatus ? Math.max(0, prev.pending - 1) : prev.pending + 1,
      purchased: newStatus ? prev.purchased + 1 : Math.max(0, prev.purchased - 1)
    }));

    try {
      await groceryAPI.toggleGroceryStatus(item._id, newStatus);
    } catch (err) {
      console.error('Failed to update grocery status:', err);
      // Revert if error
      await fetchItems();
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      if (isBulkClear) {
        await groceryAPI.clearPurchased();
      } else if (itemToDelete) {
        await groceryAPI.deleteGroceryItem(itemToDelete._id);
      }
      setConfirmOpen(false);
      setItemToDelete(null);
      setIsBulkClear(false);
      await fetchItems();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '26px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem' }}>Smart Grocery List</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track pantry needs and grocery purchases with real-time database sync
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {counts.purchased > 0 && (
            <button
              onClick={() => {
                setIsBulkClear(true);
                setItemToDelete(null);
                setConfirmOpen(true);
              }}
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: '0.88rem', color: 'var(--status-danger)' }}
            >
              <Trash2 size={16} /> Clear Purchased ({counts.purchased})
            </button>
          )}

          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Counters Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div
          onClick={() => setStatusFilter('all')}
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: statusFilter === 'all' ? 'var(--primary-green)' : 'var(--border-light)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Items</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-deep)' }}>{counts.total}</div>
          </div>
          <ShoppingBag size={24} color="var(--primary-light)" />
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: statusFilter === 'pending' ? '#B45309' : 'var(--border-light)',
            backgroundColor: statusFilter === 'pending' ? '#FEF3C7' : '#FFFFFF'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>To Buy (Pending)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400E' }}>{counts.pending}</div>
          </div>
          <Clock size={24} color="#B45309" />
        </div>

        <div
          onClick={() => setStatusFilter('purchased')}
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: statusFilter === 'purchased' ? 'var(--status-success)' : 'var(--border-light)',
            backgroundColor: statusFilter === 'purchased' ? 'var(--status-success-bg)' : '#FFFFFF'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-success)', fontWeight: 600 }}>Purchased</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-success)' }}>{counts.purchased}</div>
          </div>
          <CheckCircle size={24} color="var(--status-success)" />
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {GROCERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Department: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Status Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'purchased'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: statusFilter === st ? 'var(--primary-green)' : 'var(--bg-muted)',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grocery Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner spinner-dark" style={{ width: '36px', height: '36px' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Updating your grocery checklist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{
            backgroundColor: 'var(--primary-faint)',
            color: 'var(--primary-green)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShoppingBag size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
            {search || categoryFilter !== 'All' || statusFilter !== 'all'
              ? 'No matching grocery items found'
              : 'Your grocery list is empty'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
            {search || categoryFilter !== 'All' || statusFilter !== 'all'
              ? 'Try modifying your search or department filter.'
              : 'Keep track of ingredients for upcoming meals by adding items to your shopping list.'}
          </p>
          <button
            onClick={() => {
              if (search || categoryFilter !== 'All' || statusFilter !== 'all') {
                setSearch('');
                setCategoryFilter('All');
                setStatusFilter('all');
              } else {
                setEditingItem(null);
                setModalOpen(true);
              }
            }}
            className="btn-primary"
          >
            {search || categoryFilter !== 'All' || statusFilter !== 'all'
              ? 'Reset Filters'
              : 'Add First Item'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <GroceryItemRow
              key={item._id}
              item={item}
              onToggleStatus={handleToggleStatus}
              onEdit={(it) => {
                setEditingItem(it);
                setModalOpen(true);
              }}
              onDelete={(it) => {
                setItemToDelete(it);
                setIsBulkClear(false);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Grocery Item Modal */}
      <GroceryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={isBulkClear ? 'Clear All Purchased Items' : 'Delete Grocery Item'}
        message={
          isBulkClear
            ? `Are you sure you want to permanently delete all ${counts.purchased} purchased grocery items from your list?`
            : `Are you sure you want to delete "${itemToDelete?.name}" from your grocery list?`
        }
        confirmText={isBulkClear ? 'Yes, Clear Purchased' : 'Delete Item'}
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setItemToDelete(null);
          setIsBulkClear(false);
        }}
      />
    </div>
  );
};

export default GroceryPage;
