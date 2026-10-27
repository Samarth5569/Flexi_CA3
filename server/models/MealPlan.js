const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for meal plan'],
      index: true
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe reference is required for meal plan']
    },
    date: {
      type: Date,
      required: [true, 'Meal date is required']
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: {
        values: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        message: '{VALUE} is not a valid meal type'
      },
      default: 'Dinner'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user's plans by date range
mealPlanSchema.index({ user: 1, date: 1 });
mealPlanSchema.index({ user: 1, mealType: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
