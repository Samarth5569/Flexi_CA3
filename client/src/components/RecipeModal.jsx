import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Salad',
  'Soup',
  'Beverage',
  'Vegetarian',
  'Other'
];

const RecipeModal = ({ isOpen, onClose, onSave, editingRecipe = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(20);
  const [servings, setServings] = useState(2);
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '' }
  ]);
  const [instructions, setInstructions] = useState(['']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title || '');
      setDescription(editingRecipe.description || '');
      setCategory(editingRecipe.category || 'Dinner');
      setDifficulty(editingRecipe.difficulty || 'Medium');
      setPrepTime(editingRecipe.prepTime ?? 15);
      setCookTime(editingRecipe.cookTime ?? 20);
      setServings(editingRecipe.servings ?? 2);
      setImageUrl(editingRecipe.imageUrl || '');
      setIngredients(
        editingRecipe.ingredients && editingRecipe.ingredients.length > 0
          ? editingRecipe.ingredients
          : [{ name: '', quantity: '', unit: '' }]
      );
      setInstructions(
        editingRecipe.instructions && editingRecipe.instructions.length > 0
          ? editingRecipe.instructions
          : ['']
      );
    } else {
      resetForm();
    }
    setError('');
  }, [editingRecipe, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Dinner');
    setDifficulty('Medium');
    setPrepTime(15);
    setCookTime(20);
    setServings(2);
    setImageUrl('');
    setIngredients([{ name: '', quantity: '', unit: '' }]);
    setInstructions(['']);
    setError('');
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredientRow = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstructionStep = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionStep = (index) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Recipe title is required.');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name && ing.name.trim().length > 0);
    if (validIngredients.length === 0) {
      setError('Please provide at least one ingredient with a name.');
      return;
    }

    const validInstructions = instructions.filter((step) => step && step.trim().length > 0);
    if (validInstructions.length === 0) {
      setError('Please provide at least one cooking instruction step.');
      return;
    }

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      imageUrl: imageUrl.trim(),
      ingredients: validIngredients,
      instructions: validInstructions
    };

    try {
      setSubmitting(true);
      await onSave(recipeData, editingRecipe?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save recipe. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: 'var(--primary-faint)',
              color: 'var(--primary-green)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <ChefHat size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>
                {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {editingRecipe ? 'Update recipe details and instructions' : 'Add your culinary creation to your collection'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Recipe Title <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Creamy Tuscan Garlic Chicken"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Summary</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Brief flavor profile, serving ideas, or dietary notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category & Difficulty Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Prep Time, Cook Time, Servings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Prep Time (min)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cook Time (min)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Servings</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Ingredients Section */}
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Ingredients <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={addIngredientRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--primary-green)'
                }}
              >
                <Plus size={15} /> Add Ingredient
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingredient name (e.g. Olive Oil)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    style={{ flex: 3 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Qty (e.g. 2)"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Unit (tbsp)"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    style={{ flex: 1.2 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(idx)}
                    disabled={ingredients.length <= 1}
                    style={{
                      padding: '8px',
                      color: ingredients.length > 1 ? 'var(--status-danger)' : 'var(--text-light)'
                    }}
                    title="Remove ingredient"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div style={{ marginTop: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Instructions / Steps <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={addInstructionStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--primary-green)'
                }}
              >
                <Plus size={15} /> Add Step
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {instructions.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--primary-deep)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '9px',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder={`Step ${idx + 1} instructions...`}
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstructionStep(idx)}
                    disabled={instructions.length <= 1}
                    style={{
                      padding: '8px',
                      color: instructions.length > 1 ? 'var(--status-danger)' : 'var(--text-light)',
                      marginTop: '6px'
                    }}
                    title="Remove step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
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
                  <span>Saving Recipe...</span>
                </>
              ) : (
                <span>{editingRecipe ? 'Update Recipe' : 'Create Recipe'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeModal;
