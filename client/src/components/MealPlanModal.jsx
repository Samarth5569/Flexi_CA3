import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { recipeAPI } from '../services/api';

const MealPlanModal = ({
  isOpen,
  onClose,
  onSave,
  initialRecipe = null,
  initialDate = null,
  initialMealType = 'Dinner',
  editingPlan = null
}) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('Dinner');
  const [notes, setNotes] = useState('');
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Format today's date in YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const res = await recipeAPI.getRecipes();
        if (res.data) {
          setRecipes(res.data);
          if (!editingPlan && !initialRecipe && res.data.length > 0) {
            setSelectedRecipeId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load recipes for planner:', err);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchUserRecipes();

    if (editingPlan) {
      setSelectedRecipeId(editingPlan.recipe?._id || editingPlan.recipe || '');
      setDate(editingPlan.date ? new Date(editingPlan.date).toISOString().split('T')[0] : getTodayString());
      setMealType(editingPlan.mealType || 'Dinner');
      setNotes(editingPlan.notes || '');
    } else {
      setSelectedRecipeId(initialRecipe?._id || '');
      setDate(initialDate ? new Date(initialDate).toISOString().split('T')[0] : getTodayString());
      setMealType(initialMealType || 'Dinner');
      setNotes('');
    }

    setError('');
  }, [isOpen, initialRecipe, initialDate, initialMealType, editingPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRecipeId) {
      setError('Please select a recipe to schedule.');
      return;
    }

    if (!date) {
      setError('Please choose a valid meal date.');
      return;
    }

    const payload = {
      recipe: selectedRecipeId,
      date,
      mealType,
      notes: notes.trim()
    };

    try {
      setSubmitting(true);
      await onSave(payload, editingPlan?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save meal plan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px' }}
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
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>
                {editingPlan ? 'Edit Planned Meal' : 'Schedule a Meal'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Organize your nutritional routine on the weekly calendar
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {recipes.length === 0 && !loadingRecipes && (
          <div className="alert-box alert-warning">
            <span>You don't have any recipes yet! Create a recipe first so you can plan it.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Recipe Select */}
          <div className="form-group">
            <label className="form-label">
              Select Recipe <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <select
              className="form-select"
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              disabled={loadingRecipes || recipes.length === 0}
              required
            >
              {recipes.length === 0 && (
                <option value="">No recipes available</option>
              )}
              {recipes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Meal Type Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Date <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Meal Slot</label>
              <select
                className="form-select"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Preparation Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Marinate chicken morning of, invite friends..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
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
              disabled={submitting || recipes.length === 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>{editingPlan ? 'Update Plan' : 'Add to Plan'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlanModal;
