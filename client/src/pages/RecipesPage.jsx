import React, { useState, useEffect } from 'react';
import { recipeAPI, mealPlanAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import RecipeModal from '../components/RecipeModal';
import RecipeDetailModal from '../components/RecipeDetailModal';
import MealPlanModal from '../components/MealPlanModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Search,
  Filter,
  Plus,
  UtensilsCrossed,
  Heart,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'All',
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

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [recipeToPlan, setRecipeToPlan] = useState(null);

  // Deletion confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search,
        category,
        difficulty,
        isFavorite: showFavoritesOnly ? 'true' : '',
        sort: sort === 'newest' ? '' : sort
      };
      const res = await recipeAPI.getRecipes(params);
      if (res && res.data) {
        setRecipes(res.data);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError(err.message || 'Failed to fetch recipes from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, difficulty, showFavoritesOnly, sort]);

  const handleSaveRecipe = async (recipeData, recipeId) => {
    if (recipeId) {
      await recipeAPI.updateRecipe(recipeId, recipeData);
    } else {
      await recipeAPI.createRecipe(recipeData);
    }
    await fetchRecipes();
  };

  const handleToggleFavorite = async (recipeId) => {
    await recipeAPI.toggleFavorite(recipeId);
    // Update local state smoothly
    setRecipes((prev) =>
      prev.map((r) =>
        r._id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
      )
    );
    if (selectedRecipe && selectedRecipe._id === recipeId) {
      setSelectedRecipe((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    try {
      setDeleting(true);
      await recipeAPI.deleteRecipe(recipeToDelete._id);
      setConfirmOpen(false);
      setRecipeToDelete(null);
      await fetchRecipes();
    } catch (err) {
      alert(err.message || 'Failed to delete recipe.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePlanMealSave = async (planData) => {
    await mealPlanAPI.createMealPlan(planData);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '26px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem' }}>Recipe Collection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse, search, and curate your personalized culinary database
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecipe(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>New Recipe</span>
        </button>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
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
              placeholder="Search recipes by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="oldest">Sort: Oldest Added</option>
              <option value="prepTime_asc">Sort: Fastest Prep</option>
              <option value="title_asc">Sort: Title (A-Z)</option>
            </select>
          </div>

          {/* Favorites Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              backgroundColor: showFavoritesOnly ? 'var(--status-danger-bg)' : '#FFFFFF',
              color: showFavoritesOnly ? 'var(--status-danger)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <Heart size={16} fill={showFavoritesOnly ? '#DC2626' : 'none'} />
            <span>{showFavoritesOnly ? 'Favorites Only' : 'All Recipes'}</span>
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner spinner-dark" style={{ width: '36px', height: '36px' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading recipes from database...</p>
        </div>
      ) : recipes.length === 0 ? (
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
            <UtensilsCrossed size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
            {search || category !== 'All' || difficulty !== 'All' || showFavoritesOnly
              ? 'No matching recipes found'
              : 'Your recipe collection is empty'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
            {search || category !== 'All' || difficulty !== 'All' || showFavoritesOnly
              ? 'Try clearing your filters or search keywords to see more recipes.'
              : 'Start your culinary journey by adding your first signature recipe with ingredients and preparation steps.'}
          </p>
          <button
            onClick={() => {
              if (search || category !== 'All' || difficulty !== 'All' || showFavoritesOnly) {
                setSearch('');
                setCategory('All');
                setDifficulty('All');
                setShowFavoritesOnly(false);
              } else {
                setEditingRecipe(null);
                setModalOpen(true);
              }
            }}
            className="btn-primary"
          >
            {search || category !== 'All' || difficulty !== 'All' || showFavoritesOnly
              ? 'Clear All Filters'
              : 'Add Your First Recipe'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onView={(r) => {
                setSelectedRecipe(r);
                setDetailModalOpen(true);
              }}
              onEdit={(r) => {
                setEditingRecipe(r);
                setModalOpen(true);
              }}
              onDelete={(r) => {
                setRecipeToDelete(r);
                setConfirmOpen(true);
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Recipe Modal */}
      <RecipeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRecipe}
        editingRecipe={editingRecipe}
      />

      {/* Recipe Detail View Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(r) => {
          setSelectedRecipe(null);
          setDetailModalOpen(false);
          setEditingRecipe(r);
          setModalOpen(true);
        }}
        onPlanMeal={(r) => {
          setRecipeToPlan(r);
          setDetailModalOpen(false);
          setPlanModalOpen(true);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Schedule Meal Plan Modal */}
      <MealPlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={handlePlanMealSave}
        initialRecipe={recipeToPlan}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Recipe"
        message={`Are you sure you want to permanently delete "${recipeToDelete?.title}"? Any scheduled meals referencing this recipe will also be removed.`}
        confirmText="Yes, Delete Recipe"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setRecipeToDelete(null);
        }}
      />
    </div>
  );
};

export default RecipesPage;
