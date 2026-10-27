const express = require('express');
const router = express.Router();
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleFavorite
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All recipe routes require authentication

router.route('/')
  .get(getRecipes)
  .post(createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
