import React, { useState, useEffect } from 'react';
import { mealPlanAPI, recipeAPI } from '../services/api';
import MealPlanModal from '../components/MealPlanModal';
import RecipeDetailModal from '../components/RecipeDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  UtensilsCrossed,
  ChefHat,
  AlertCircle
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlannerPage = () => {
  // Current week anchor date (defaults to current date)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [slotPrefill, setSlotPrefill] = useState({ date: null, mealType: 'Dinner' });

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Deletion confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Calculate Monday of the current selected week
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMonday(currentDate);

  // Generate the 7 days of the current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fetchWeekPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const startDateStr = monday.toISOString().split('T')[0];
      const endDateStr = sunday.toISOString().split('T')[0];

      const res = await mealPlanAPI.getMealPlans({
        startDate: startDateStr,
        endDate: endDateStr
      });

      if (res && res.data) {
        setMealPlans(res.data);
      }
    } catch (err) {
      console.error('Failed to load meal plans:', err);
      setError(err.message || 'Unable to fetch meal plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekPlans();
  }, [currentDate]);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSavePlan = async (payload, planId) => {
    if (planId) {
      await mealPlanAPI.updateMealPlan(planId, payload);
    } else {
      await mealPlanAPI.createMealPlan(payload);
    }
    await fetchWeekPlans();
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      setDeleting(true);
      await mealPlanAPI.deleteMealPlan(planToDelete._id);
      setConfirmOpen(false);
      setPlanToDelete(null);
      await fetchWeekPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete planned meal.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper to find plans for a specific date and mealType
  const getPlansForSlot = (dayDate, slotName) => {
    const target = dayDate.toISOString().split('T')[0];
    return mealPlans.filter((plan) => {
      const planDate = new Date(plan.date).toISOString().split('T')[0];
      return planDate === target && plan.mealType.toLowerCase() === slotName.toLowerCase();
    });
  };

  return (
    <div>
      {/* Top Header & Week Navigation Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '26px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem' }}>Weekly Meal Planner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Schedule and structure your nutrition across the days of the week
          </p>
        </div>

        {/* Date Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={handlePrevWeek}
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--primary-deep)' }}
            title="Previous Week"
          >
            <ChevronLeft size={20} />
          </button>

          <span style={{
            fontWeight: 700,
            fontSize: '0.92rem',
            color: 'var(--primary-deep)',
            padding: '0 8px',
            whiteSpace: 'nowrap'
          }}>
            {monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <button
            onClick={handleNextWeek}
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--primary-deep)' }}
            title="Next Week"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={handleToday}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.8rem', marginLeft: '6px' }}
          >
            Today
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Weekly Planner Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner spinner-dark" style={{ width: '36px', height: '36px' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading weekly schedule...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          {weekDays.map((day, dayIndex) => {
            const isToday =
              day.toDateString() === new Date().toDateString();

            return (
              <div
                key={dayIndex}
                className="card"
                style={{
                  padding: '16px',
                  backgroundColor: isToday ? 'var(--primary-faint)' : '#FFFFFF',
                  borderColor: isToday ? 'var(--primary-light)' : 'var(--border-light)'
                }}
              >
                {/* Day Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '10px',
                  marginBottom: '14px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: isToday ? 'var(--primary-green)' : 'var(--primary-deep)',
                      display: 'block'
                    }}>
                      {DAYS_OF_WEEK[dayIndex]}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {isToday && (
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                      Today
                    </span>
                  )}
                </div>

                {/* Meal Slots (Breakfast, Lunch, Dinner) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {MEAL_SLOTS.map((slot) => {
                    const slotPlans = getPlansForSlot(day, slot);

                    return (
                      <div
                        key={slot}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px'
                        }}>
                          <span style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: 'var(--text-muted)'
                          }}>
                            {slot}
                          </span>

                          <button
                            onClick={() => {
                              setEditingPlan(null);
                              setSlotPrefill({ date: day, mealType: slot });
                              setPlanModalOpen(true);
                            }}
                            style={{
                              color: 'var(--primary-green)',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={`Add ${slot}`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        {slotPlans.length === 0 ? (
                          <div
                            onClick={() => {
                              setEditingPlan(null);
                              setSlotPrefill({ date: day, mealType: slot });
                              setPlanModalOpen(true);
                            }}
                            style={{
                              padding: '8px',
                              border: '1px dashed var(--border-light)',
                              borderRadius: '6px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              color: 'var(--text-light)',
                              fontSize: '0.78rem'
                            }}
                          >
                            + Plan meal
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {slotPlans.map((plan) => (
                              <div
                                key={plan._id}
                                style={{
                                  padding: '8px 10px',
                                  backgroundColor: 'var(--bg-app)',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-light)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px'
                                }}
                              >
                                <div
                                  style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                                  onClick={async () => {
                                    if (plan.recipe?._id) {
                                      const full = await recipeAPI.getRecipeById(plan.recipe._id);
                                      setSelectedRecipe(full.data);
                                      setDetailModalOpen(true);
                                    }
                                  }}
                                >
                                  <div style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    color: 'var(--primary-deep)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {plan.recipe?.title || 'Planned Recipe'}
                                  </div>
                                  {plan.notes && (
                                    <div style={{
                                      fontSize: '0.72rem',
                                      color: 'var(--text-muted)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {plan.notes}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    setPlanToDelete(plan);
                                    setConfirmOpen(true);
                                  }}
                                  style={{
                                    color: 'var(--status-danger)',
                                    padding: '4px',
                                    flexShrink: 0
                                  }}
                                  title="Remove from schedule"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meal Plan Modal */}
      <MealPlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={handleSavePlan}
        initialDate={slotPrefill.date}
        initialMealType={slotPrefill.mealType}
        editingPlan={editingPlan}
      />

      {/* Recipe Details Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={() => {}}
        onPlanMeal={() => {}}
        onToggleFavorite={() => {}}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Remove Meal Plan"
        message={`Are you sure you want to remove "${planToDelete?.recipe?.title || 'this meal'}" from your weekly schedule?`}
        confirmText="Remove Meal"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setPlanToDelete(null);
        }}
      />
    </div>
  );
};

export default MealPlannerPage;
