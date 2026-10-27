const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

// @desc    Create a meal plan entry
// @route   POST /api/meal-plans
// @access  Private
const createMealPlan = async (req, res, next) => {
  try {
    const { recipe: recipeId, date, mealType, notes } = req.body;

    if (!recipeId || !date || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipe, date, and meal type'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    // Verify recipe exists and belongs to the authenticated user
    const recipe = await Recipe.findOne({ _id: recipeId, user: req.user._id });
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or does not belong to your account'
      });
    }

    const mealDate = new Date(date);
    if (isNaN(mealDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      recipe: recipeId,
      date: mealDate,
      mealType,
      notes: notes ? notes.trim() : ''
    });

    const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate(
      'recipe',
      'title category prepTime cookTime difficulty imageUrl servings'
    );

    return res.status(201).json({
      success: true,
      message: 'Meal plan added successfully',
      data: populatedMealPlan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meal plans for current user with optional date range
// @route   GET /api/meal-plans
// @access  Private
const getMealPlans = async (req, res, next) => {
  try {
    const { startDate, endDate, mealType } = req.query;

    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          filter.date.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          filter.date.$lte = end;
        }
      }
    }

    if (mealType && ['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(mealType)) {
      filter.mealType = mealType;
    }

    const mealPlans = await MealPlan.find(filter)
      .populate('recipe', 'title category prepTime cookTime difficulty imageUrl servings')
      .sort({ date: 1, mealType: 1 });

    return res.status(200).json({
      success: true,
      count: mealPlans.length,
      data: mealPlans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Private
const getMealPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID format'
      });
    }

    const mealPlan = await MealPlan.findOne({ _id: id, user: req.user._id }).populate(
      'recipe',
      'title category prepTime cookTime difficulty imageUrl servings instructions ingredients'
    );

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
const updateMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID format'
      });
    }

    const mealPlan = await MealPlan.findOne({ _id: id, user: req.user._id });
    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found or access denied'
      });
    }

    const { recipe: newRecipeId, date, mealType, notes } = req.body;

    if (newRecipeId) {
      if (!mongoose.Types.ObjectId.isValid(newRecipeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipe ID format'
        });
      }

      // Verify that the new recipe also belongs to the user
      const recipeExists = await Recipe.findOne({ _id: newRecipeId, user: req.user._id });
      if (!recipeExists) {
        return res.status(404).json({
          success: false,
          message: 'Target recipe not found or does not belong to your account'
        });
      }
      mealPlan.recipe = newRecipeId;
    }

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      mealPlan.date = parsedDate;
    }

    if (mealType && ['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(mealType)) {
      mealPlan.mealType = mealType;
    }

    if (notes !== undefined) {
      mealPlan.notes = notes.trim();
    }

    await mealPlan.save();

    const updatedPlan = await MealPlan.findById(mealPlan._id).populate(
      'recipe',
      'title category prepTime cookTime difficulty imageUrl servings'
    );

    return res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
const deleteMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID format'
      });
    }

    const mealPlan = await MealPlan.findOneAndDelete({ _id: id, user: req.user._id });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meal plan removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan
};
