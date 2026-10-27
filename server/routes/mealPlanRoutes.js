const express = require('express');
const router = express.Router();
const {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All meal plan routes require authentication

router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

router.route('/:id')
  .get(getMealPlanById)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

module.exports = router;
