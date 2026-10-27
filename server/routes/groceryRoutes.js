const express = require('express');
const router = express.Router();
const {
  createGroceryItem,
  getGroceryItems,
  getGroceryItemById,
  updateGroceryItem,
  toggleGroceryStatus,
  deleteGroceryItem,
  clearPurchasedItems
} = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All grocery routes require authentication

router.route('/')
  .get(getGroceryItems)
  .post(createGroceryItem);

router.delete('/purchased/clear', clearPurchasedItems);

router.route('/:id')
  .get(getGroceryItemById)
  .put(updateGroceryItem)
  .delete(deleteGroceryItem);

router.patch('/:id/status', toggleGroceryStatus);

module.exports = router;
