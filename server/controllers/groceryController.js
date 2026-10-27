const mongoose = require('mongoose');
const GroceryItem = require('../models/GroceryItem');

// @desc    Add a grocery item
// @route   POST /api/grocery
// @access  Private
const createGroceryItem = async (req, res, next) => {
  try {
    const { name, quantity, unit, category, isPurchased } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    const item = await GroceryItem.create({
      name: name.trim(),
      quantity: quantity !== undefined ? String(quantity).trim() : '1',
      unit: unit ? unit.trim() : 'pcs',
      category: category || 'Produce',
      isPurchased: Boolean(isPurchased),
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Grocery item added successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all grocery items for current user with filtering
// @route   GET /api/grocery
// @access  Private
const getGroceryItems = async (req, res, next) => {
  try {
    const { status, search, category } = req.query;

    const filter = { user: req.user._id };

    if (status === 'pending') {
      filter.isPurchased = false;
    } else if (status === 'purchased') {
      filter.isPurchased = true;
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: sanitized, $options: 'i' };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    // Sort pending items to the top, then newest first
    const items = await GroceryItem.find(filter).sort({ isPurchased: 1, createdAt: -1 });

    const totalCount = await GroceryItem.countDocuments({ user: req.user._id });
    const pendingCount = await GroceryItem.countDocuments({ user: req.user._id, isPurchased: false });
    const purchasedCount = await GroceryItem.countDocuments({ user: req.user._id, isPurchased: true });

    return res.status(200).json({
      success: true,
      count: items.length,
      counts: {
        total: totalCount,
        pending: pendingCount,
        purchased: purchasedCount
      },
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single grocery item
// @route   GET /api/grocery/:id
// @access  Private
const getGroceryItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await GroceryItem.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grocery item
// @route   PUT /api/grocery/:id
// @access  Private
const updateGroceryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await GroceryItem.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found or access denied'
      });
    }

    const { name, quantity, unit, category, isPurchased } = req.body;

    if (name !== undefined) item.name = name.trim();
    if (quantity !== undefined) item.quantity = String(quantity).trim();
    if (unit !== undefined) item.unit = unit.trim();
    if (category !== undefined) item.category = category;
    if (isPurchased !== undefined) item.isPurchased = Boolean(isPurchased);

    const updatedItem = await item.save();

    return res.status(200).json({
      success: true,
      message: 'Grocery item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or set grocery item purchased status
// @route   PATCH /api/grocery/:id/status
// @access  Private
const toggleGroceryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await GroceryItem.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found'
      });
    }

    if (req.body.isPurchased !== undefined) {
      item.isPurchased = Boolean(req.body.isPurchased);
    } else {
      item.isPurchased = !item.isPurchased;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: item.isPurchased ? 'Item marked as purchased' : 'Item marked as pending',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete grocery item
// @route   DELETE /api/grocery/:id
// @access  Private
const deleteGroceryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await GroceryItem.findOneAndDelete({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from grocery list'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all purchased items for current user
// @route   DELETE /api/grocery/purchased/clear
// @access  Private
const clearPurchasedItems = async (req, res, next) => {
  try {
    const result = await GroceryItem.deleteMany({
      user: req.user._id,
      isPurchased: true
    });

    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} purchased item(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroceryItem,
  getGroceryItems,
  getGroceryItemById,
  updateGroceryItem,
  toggleGroceryStatus,
  deleteGroceryItem,
  clearPurchasedItems
};
