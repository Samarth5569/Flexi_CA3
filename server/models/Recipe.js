const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true
    },
    quantity: {
      type: String,
      trim: true,
      default: ''
    },
    unit: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A recipe must include at least one ingredient'
      }
    },
    instructions: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A recipe must include at least one instruction step'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Breakfast',
          'Lunch',
          'Dinner',
          'Dessert',
          'Snack',
          'Salad',
          'Soup',
          'Beverage',
          'Vegetarian',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      },
      default: 'Dinner'
    },
    prepTime: {
      type: Number,
      min: [0, 'Preparation time cannot be negative'],
      default: 15
    },
    cookTime: {
      type: Number,
      min: [0, 'Cooking time cannot be negative'],
      default: 20
    },
    servings: {
      type: Number,
      min: [1, 'Servings must be at least 1'],
      default: 2
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty level'
      },
      default: 'Medium'
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe owner user reference is required'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user query optimization and searching
recipeSchema.index({ user: 1, title: 1 });
recipeSchema.index({ user: 1, category: 1 });
recipeSchema.index({ user: 1, isFavorite: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
