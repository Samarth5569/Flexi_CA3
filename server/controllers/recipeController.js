const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      imageUrl,
      isFavorite
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipe title is required'
      });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one ingredient is required'
      });
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one cooking step instruction is required'
      });
    }

    // Clean ingredients array
    const formattedIngredients = ingredients
      .map((ing) => {
        if (typeof ing === 'string') {
          return { name: ing.trim(), quantity: '', unit: '' };
        }
        return {
          name: ing.name ? ing.name.trim() : '',
          quantity: ing.quantity ? String(ing.quantity).trim() : '',
          unit: ing.unit ? String(ing.unit).trim() : ''
        };
      })
      .filter((ing) => ing.name.length > 0);

    if (formattedIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid ingredient names must be provided'
      });
    }

    // Clean instructions array
    const formattedInstructions = instructions
      .map((step) => (typeof step === 'string' ? step.trim() : ''))
      .filter((step) => step.length > 0);

    if (formattedInstructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid cooking instruction steps must be provided'
      });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
      category: category || 'Dinner',
      prepTime: Number(prepTime) >= 0 ? Number(prepTime) : 15,
      cookTime: Number(cookTime) >= 0 ? Number(cookTime) : 20,
      servings: Number(servings) >= 1 ? Number(servings) : 2,
      difficulty: difficulty || 'Medium',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      isFavorite: Boolean(isFavorite),
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recipes for current user with search, filter, and sort
// @route   GET /api/recipes
// @access  Private
const getRecipes = async (req, res, next) => {
  try {
    const { search, category, difficulty, isFavorite, sort } = req.query;

    // Strict user-level data isolation
    const filter = { user: req.user._id };

    // Search query parameter (searches in title or description)
    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    // Favorite filter
    if (isFavorite !== undefined && isFavorite !== '') {
      filter.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'title_asc') sortOptions = { title: 1 };
    if (sort === 'title_desc') sortOptions = { title: -1 };
    if (sort === 'prepTime_asc') sortOptions = { prepTime: 1 };
    if (sort === 'prepTime_desc') sortOptions = { prepTime: -1 };
    if (sort === 'cookTime_asc') sortOptions = { cookTime: 1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const recipes = await Recipe.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Private
const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    const recipe = await Recipe.findOne({ _id: id, user: req.user._id });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or you do not have permission to view it'
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipe by ID
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    const recipe = await Recipe.findOne({ _id: id, user: req.user._id });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or you do not have permission to edit it'
      });
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      imageUrl,
      isFavorite
    } = req.body;

    if (title !== undefined) recipe.title = title.trim();
    if (description !== undefined) recipe.description = description.trim();
    if (category !== undefined) recipe.category = category;
    if (prepTime !== undefined) recipe.prepTime = Number(prepTime);
    if (cookTime !== undefined) recipe.cookTime = Number(cookTime);
    if (servings !== undefined) recipe.servings = Number(servings);
    if (difficulty !== undefined) recipe.difficulty = difficulty;
    if (imageUrl !== undefined) recipe.imageUrl = imageUrl.trim();
    if (isFavorite !== undefined) recipe.isFavorite = Boolean(isFavorite);

    if (ingredients && Array.isArray(ingredients)) {
      const formattedIngredients = ingredients
        .map((ing) => {
          if (typeof ing === 'string') {
            return { name: ing.trim(), quantity: '', unit: '' };
          }
          return {
            name: ing.name ? ing.name.trim() : '',
            quantity: ing.quantity ? String(ing.quantity).trim() : '',
            unit: ing.unit ? String(ing.unit).trim() : ''
          };
        })
        .filter((ing) => ing.name.length > 0);

      if (formattedIngredients.length > 0) {
        recipe.ingredients = formattedIngredients;
      }
    }

    if (instructions && Array.isArray(instructions)) {
      const formattedInstructions = instructions
        .map((step) => (typeof step === 'string' ? step.trim() : ''))
        .filter((step) => step.length > 0);

      if (formattedInstructions.length > 0) {
        recipe.instructions = formattedInstructions;
      }
    }

    const updatedRecipe = await recipe.save();

    return res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: updatedRecipe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipe by ID
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    const recipe = await Recipe.findOneAndDelete({ _id: id, user: req.user._id });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or you do not have permission to delete it'
      });
    }

    // Clean up any planned meals that referenced this deleted recipe
    await MealPlan.deleteMany({ recipe: id, user: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite status of a recipe
// @route   PATCH /api/recipes/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    const recipe = await Recipe.findOne({ _id: id, user: req.user._id });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();

    return res.status(200).json({
      success: true,
      message: recipe.isFavorite ? 'Recipe marked as favorite' : 'Recipe removed from favorites',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleFavorite
};
