import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Heart,
  Calendar,
  ChefHat,
  CheckCircle2,
  Circle,
  Edit3
} from 'lucide-react';

const RecipeDetailModal = ({
  recipe,
  isOpen,
  onClose,
  onEdit,
  onPlanMeal,
  onToggleFavorite
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !recipe) return null;

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '720px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image / Banner */}
        <div style={{
          position: 'relative',
          height: '240px',
          backgroundColor: 'var(--bg-muted)'
        }}>
          {recipe.imageUrl && !imageError ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-accent-subtle)',
              color: 'var(--primary-light)'
            }}>
              <ChefHat size={56} strokeWidth={1.5} />
              <span style={{ fontWeight: 600, marginTop: '8px' }}>MealMate Kitchen Collection</span>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: 'var(--text-primary)'
            }}
          >
            <X size={20} />
          </button>

          {/* Badges on hero */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', gap: '8px' }}>
            <span className="badge badge-green" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              {recipe.category}
            </span>
            <span className="badge badge-terracotta" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1.25 }}>{recipe.title}</h2>
            <button
              onClick={() => onToggleFavorite(recipe._id)}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-muted)',
                color: recipe.isFavorite ? '#DC2626' : 'var(--text-muted)'
              }}
              title="Toggle Favorite"
            >
              <Heart size={22} fill={recipe.isFavorite ? '#DC2626' : 'none'} />
            </button>
          </div>

          {recipe.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginBottom: '22px', lineHeight: 1.6 }}>
              {recipe.description}
            </p>
          )}

          {/* Quick Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            backgroundColor: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '26px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Clock size={15} />
                <span>Prep Time</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-deep)' }}>
                {recipe.prepTime || 0} min
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Clock size={15} />
                <span>Cook Time</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-deep)' }}>
                {recipe.cookTime || 0} min
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Users size={15} />
                <span>Servings</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-deep)' }}>
                {recipe.servings || 2} persons
              </span>
            </div>
          </div>

          {/* Ingredients Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Ingredients</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({recipe.ingredients?.length || 0} items)
              </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
              {recipe.ingredients?.map((ing, idx) => {
                const isChecked = Boolean(checkedIngredients[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredientCheck(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: isChecked ? 'var(--primary-faint)' : 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={18} color="var(--primary-green)" />
                    ) : (
                      <Circle size={18} color="var(--text-light)" />
                    )}
                    <span style={{
                      fontSize: '0.92rem',
                      color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      flex: 1
                    }}>
                      {ing.name}
                    </span>
                    {(ing.quantity || ing.unit) && (
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                        {ing.quantity} {ing.unit}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Instructions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recipe.instructions?.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    padding: '12px 16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-faint)',
                    color: 'var(--primary-green)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '20px'
          }}>
            <button
              onClick={() => {
                onClose();
                onEdit(recipe);
              }}
              className="btn-secondary"
            >
              <Edit3 size={16} /> Edit Recipe
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  onClose();
                  onPlanMeal(recipe);
                }}
                className="btn-accent"
              >
                <Calendar size={16} /> Plan In Weekly Calendar
              </button>
              <button onClick={onClose} className="btn-secondary">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
