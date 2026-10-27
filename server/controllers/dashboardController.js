const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');
const GroceryItem = require('../models/GroceryItem');

// @desc    Get dashboard statistics for the authenticated user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Start of today normalized
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel queries to real MongoDB collections
    const [
      totalRecipes,
      favoriteRecipes,
      totalPlannedMeals,
      pendingGrocery,
      purchasedGrocery,
      upcomingMeals,
      recentRecipes
    ] = await Promise.all([
      Recipe.countDocuments({ user: userId }),
      Recipe.countDocuments({ user: userId, isFavorite: true }),
      MealPlan.countDocuments({ user: userId }),
      GroceryItem.countDocuments({ user: userId, isPurchased: false }),
      GroceryItem.countDocuments({ user: userId, isPurchased: true }),
      MealPlan.find({ user: userId, date: { $gte: today } })
        .sort({ date: 1, mealType: 1 })
        .limit(5)
        .populate('recipe', 'title category prepTime cookTime difficulty imageUrl'),
      Recipe.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title category difficulty prepTime cookTime imageUrl createdAt isFavorite')
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalRecipes,
        favoriteRecipes,
        totalPlannedMeals,
        pendingGrocery,
        purchasedGrocery
      },
      upcomingMeals,
      recentRecipes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
