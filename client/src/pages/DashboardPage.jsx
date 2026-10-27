import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, recipeAPI, mealPlanAPI, groceryAPI } from '../services/api';
import RecipeModal from '../components/RecipeModal';
import MealPlanModal from '../components/MealPlanModal';
import GroceryModal from '../components/GroceryModal';
import RecipeDetailModal from '../components/RecipeDetailModal';
import {
  UtensilsCrossed,
  CalendarCheck,
  ShoppingBag,
  Plus,
  Clock,
  ChevronRight,
  Sparkles,
  Heart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: {
      totalRecipes: 0,
      favoriteRecipes: 0,
      totalPlannedMeals: 0,
      pendingGrocery: 0,
      purchasedGrocery: 0
    },
    upcomingMeals: [],
    recentRecipes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      if (res && res.stats) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to connect to database. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateRecipe = async (recipeData) => {
    await recipeAPI.createRecipe(recipeData);
    await fetchDashboardData();
  };

  const handleCreateMealPlan = async (planData) => {
    await mealPlanAPI.createMealPlan(planData);
    await fetchDashboardData();
  };

  const handleCreateGrocery = async (groceryData) => {
    await groceryAPI.createGroceryItem(groceryData);
    await fetchDashboardData();
  };

  const handleToggleFavorite = async (recipeId) => {
    await recipeAPI.toggleFavorite(recipeId);
    await fetchDashboardData();
  };

  return (
    <div>
      {/* Top Greeting & Quick Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent-terracotta)'
          }}>
            Platform Overview
          </span>
          <h1 style={{ fontSize: '2.1rem', marginTop: '4px' }}>
            Welcome back, {user?.name || 'Chef'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your live meal planning snapshot and pantry overview.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setRecipeModalOpen(true)}
            className="btn-primary"
            style={{ padding: '9px 16px', fontSize: '0.88rem' }}
          >
            <Plus size={16} /> Add Recipe
          </button>
          <button
            onClick={() => setMealPlanModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '0.88rem' }}
          >
            <CalendarCheck size={16} color="var(--primary-green)" /> Schedule Meal
          </button>
          <button
            onClick={() => setGroceryModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '0.88rem' }}
          >
            <ShoppingBag size={16} color="var(--accent-terracotta)" /> Add Item
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '32px'
      }}>
        {/* Total Recipes */}
        <Link to="/recipes" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--primary-faint)',
            color: 'var(--primary-green)',
            padding: '14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UtensilsCrossed size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Recipes</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-deep)', lineHeight: 1.1 }}>
              {data.stats.totalRecipes}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
              {data.stats.favoriteRecipes} marked favorite
            </span>
          </div>
        </Link>

        {/* Planned Meals */}
        <Link to="/planner" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-terracotta)',
            padding: '14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarCheck size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Planned Meals</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-deep)', lineHeight: 1.1 }}>
              {data.stats.totalPlannedMeals}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
              Scheduled on calendar
            </span>
          </div>
        </Link>

        {/* Pending Grocery */}
        <Link to="/grocery" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            padding: '14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Groceries</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-deep)', lineHeight: 1.1 }}>
              {data.stats.pendingGrocery}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
              Need to purchase
            </span>
          </div>
        </Link>

        {/* Purchased Items */}
        <Link to="/grocery" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success)',
            padding: '14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Purchased Groceries</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-deep)', lineHeight: 1.1 }}>
              {data.stats.purchasedGrocery}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
              Checked off list
            </span>
          </div>
        </Link>
      </div>

      {/* Main Split Section: Upcoming Meals & Recent Recipes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Left: Upcoming Planned Meals */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarCheck size={20} color="var(--primary-green)" />
              <h2 style={{ fontSize: '1.25rem' }}>Upcoming Meals</h2>
            </div>
            <Link to="/planner" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-green)' }}>
              Open Planner →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div className="spinner spinner-dark"></div>
            </div>
          ) : data.upcomingMeals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 20px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)'
            }}>
              <CalendarCheck size={36} color="var(--text-light)" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                No meals scheduled yet
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Pick from your recipe catalog and plan your menu for this week.
              </p>
              <button
                onClick={() => setMealPlanModalOpen(true)}
                className="btn-secondary"
                style={{ fontSize: '0.84rem', padding: '7px 14px' }}
              >
                Plan a Meal
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.upcomingMeals.map((plan) => (
                <div
                  key={plan._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-app)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        {plan.mealType}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {new Date(plan.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.98rem', marginTop: '4px', color: 'var(--primary-deep)' }}>
                      {plan.recipe?.title || 'Custom Planned Dish'}
                    </h4>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {((plan.recipe?.prepTime || 0) + (plan.recipe?.cookTime || 0)) || 25}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recently Added Recipes */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={20} color="var(--primary-green)" />
              <h2 style={{ fontSize: '1.25rem' }}>Recent Recipes</h2>
            </div>
            <Link to="/recipes" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-green)' }}>
              View All ({data.stats.totalRecipes}) →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div className="spinner spinner-dark"></div>
            </div>
          ) : data.recentRecipes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 20px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)'
            }}>
              <UtensilsCrossed size={36} color="var(--text-light)" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Your recipe box is empty
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Add your first signature dish with step-by-step cooking steps.
              </p>
              <button
                onClick={() => setRecipeModalOpen(true)}
                className="btn-primary"
                style={{ fontSize: '0.84rem', padding: '7px 14px' }}
              >
                Create Recipe
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  onClick={async () => {
                    const full = await recipeAPI.getRecipeById(recipe._id);
                    setSelectedRecipe(full.data);
                    setDetailModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-muted)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <UtensilsCrossed size={18} color="var(--primary-light)" />
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.94rem', color: 'var(--primary-deep)', margin: 0 }}>
                        {recipe.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {recipe.category}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>•</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={16} color="var(--text-light)" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reusable Modals */}
      <RecipeModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        onSave={handleCreateRecipe}
      />

      <MealPlanModal
        isOpen={mealPlanModalOpen}
        onClose={() => setMealPlanModalOpen(false)}
        onSave={handleCreateMealPlan}
      />

      <GroceryModal
        isOpen={groceryModalOpen}
        onClose={() => setGroceryModalOpen(false)}
        onSave={handleCreateGrocery}
      />

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(r) => {
          setSelectedRecipe(r);
          setDetailModalOpen(false);
          setRecipeModalOpen(true);
        }}
        onPlanMeal={(r) => {
          setSelectedRecipe(r);
          setDetailModalOpen(false);
          setMealPlanModalOpen(true);
        }}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
};

export default DashboardPage;
