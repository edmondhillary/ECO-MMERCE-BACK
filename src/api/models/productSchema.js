import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
          required: true,
        },
        commentary: {
          type: String,
        },
        postedAt: {
          type: Date,
          default: Date.now,
        },
        editedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    toObject: { getters: true },
    toJSON: { getters: true },
    timestamps: true,
  }
);

productSchema.virtual("reviewsCount").get(function () {
  return this.reviews.length;
});

productSchema.virtual("overallRating").get(function () {
  const arrLength = this.reviews.length;
  const allRatings = this.reviews.reduce(
    (previous, { rating }) => previous + rating,
    0
  );
  const overallRating = allRatings / arrLength;
  const roundToHalf = Math.round(overallRating / 0.5) * 0.5;
  return !roundToHalf ? 0 : roundToHalf;
});

// Crear un slug antes de guardar el producto
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
