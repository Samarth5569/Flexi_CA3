import React, { useState } from 'react';
import {
  Clock,
  Users,
  Heart,
  Edit3,
  Trash2,
  ChefHat,
  ChevronRight
} from 'lucide-react';

const RecipeCard = ({
  recipe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const [imageError, setImageError] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      setToggling(true);
      await onToggleFavorite(recipe._id);
    } finally {
      setToggling(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="badge badge-green">Easy</span>;
      case 'Medium':
        return <span className="badge badge-terracotta">Medium</span>;
      case 'Hard':
        return <span className="badge badge-danger">Hard</span>;
      default:
        return <span className="badge badge-gray">{difficulty}</span>;
    }
  };

  return (
    <div
      className="card card-hover"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer'
      }}
      onClick={() => onView(recipe)}
    >
      {/* Recipe Image or Fallback Header */}
      <div style={{
        height: '180px',
        position: 'relative',
        backgroundColor: 'var(--bg-muted)',
        overflow: 'hidden'
      }}>
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
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
            <ChefHat size={46} strokeWidth={1.5} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '6px' }}>MealMate Kitchen</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={toggling}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: recipe.isFavorite ? '#DC2626' : 'var(--text-muted)'
          }}
          title={recipe.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
        >
          <Heart size={18} fill={recipe.isFavorite ? '#DC2626' : 'none'} />
        </button>

        {/* Category Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px'
        }}>
          <span className="badge badge-green" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {recipe.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          {getDifficultyBadge(recipe.difficulty)}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} />
              {recipe.servings || 2}
            </span>
          </div>
        </div>

        <h3 style={{
          fontSize: '1.18rem',
          marginBottom: '6px',
          color: 'var(--primary-deep)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {recipe.title}
        </h3>

        <p style={{
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {recipe.description || 'A delightful homemade recipe.'}
        </p>

        {/* Card Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '14px',
          marginTop: 'auto'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--primary-green)'
          }}>
            View recipe <ChevronRight size={14} />
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(recipe)}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-muted)'
              }}
              title="Edit recipe"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(recipe)}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-danger)',
                backgroundColor: '#FEE2E2'
              }}
              title="Delete recipe"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
