const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    quantity: {
      type: String,
      trim: true,
      default: '1'
    },
    unit: {
      type: String,
      trim: true,
      default: 'pcs'
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: [
          'Produce',
          'Dairy & Eggs',
          'Meat & Seafood',
          'Pantry & Dry Goods',
          'Bakery',
          'Frozen Foods',
          'Beverages',
          'Spices & Seasonings',
          'Snacks',
          'Other'
        ],
        message: '{VALUE} is not a valid grocery category'
      },
      default: 'Produce'
    },
    isPurchased: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner user reference is required'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

groceryItemSchema.index({ user: 1, isPurchased: 1 });
groceryItemSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('GroceryItem', groceryItemSchema);
