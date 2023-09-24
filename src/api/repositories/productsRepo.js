import {
  databaseException,
  validationException,
} from "../errors/productErrors.js";
import productModel from "../models/productSchema.js";
import { databaseLog } from "../../database/database.log.js";
import { Types } from "mongoose";
const { ObjectId } = Types;


export async function getAll(query) {
  const getAllProducts = await productModel
    .find(query)
    .sort({ category: 1, name: 1 })
    .populate("reviews.user", "_id username")
    .exec();
  const response = getAllProducts.map((i) => i.toObject());
  return response;
}

export async function getAllPage(query, page) {
  const limit = 20;
  const skip = limit * (page - 1);
  const getAllProducts = await productModel
    .find(query)
    .sort({ category: 1, name: 1 })
    .limit(limit)
    .skip(skip)
    .populate("reviews.user", "_id username")
    .exec();
  const response = getAllProducts.map((i) => i.toObject());
  return response;
}

export async function search(search, page) {
  const limit = !page ? 0 : 20;
  const skip = !page ? 0 : limit * (page - 1);
  const searchProducts = await productModel
    .find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    })
    .sort({ category: 1, name: 1 })
    .limit(limit)
    .skip(skip)
    .populate("reviews.user", "_id username")
    .exec();
  const response = searchProducts.map((i) => i.toObject());
  return response;
}

export async function getById(id) {
  const productById = await productModel
    .findOne({ _id: id })
    .populate("reviews.user", "_id firstName")
    .populate("price name");
  if (!productById) throw new databaseException("Product not found.");
  return productById.toObject();
}
export async function getProductById(id) {
  try {
    const product = await productModel.findById(id); // Usa el método findById de Mongoose
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw error;
  }
}
export async function create(inputs) {
  const createdProduct = await productModel.create(inputs);
  databaseLog("ecoDent", "products", "create", createdProduct._id);
  return createdProduct.toObject();
}

export async function updateById(id, inputs) {
  const getProduct = await productModel
    .findOneAndUpdate({ _id: id }, inputs)
    .exec();
  if (!getProduct) throw new databaseException("Product not found.");
  const updatedProduct = await productModel
    .findOne({ _id: id })
    .populate("reviews.user", "_id username")
    .exec();
  databaseLog("ecoDent", "products", "update", updatedProduct._id);
  return updatedProduct.toObject();
}

export async function deleteById(id) {
  const deletedProduct = await productModel
    .findOneAndDelete({ _id: id })
    .populate("reviews.user", "_id username")
    .exec();
  if (!deletedProduct) throw new databaseException("Product not found.");
  databaseLog("ecoDent", "products", "delete", deletedProduct._id);
  return deletedProduct.toObject();
}

export async function getAllReviewsOfProduct(productId) {
  const product = await productModel.findById(productId).select("reviews");
  if (!product) {
    throw new Error("Product not found");
  }
  return product.reviews;
}

export async function deleteReviewById(reviewId, user, role) {
  console.log({ user });
  console.log({ role });
  console.log({ reviewId });

  const product = await productModel.findOne({ "reviews._id": reviewId });
  if (!product) {
    throw new Error("Review not found");
  }

  const review = product.reviews.id(reviewId);
  if (role !== "admin" && review.user.toString() !== user.toString()) {
    throw new Error("Unauthorized: You can only delete your own reviews.");
  }

  product.reviews.pull({ _id: reviewId }); // Aquí usamos pull
  await product.save();

  return review;
}

export async function getAllReviewsOfUser(user) {
  const pipeline = [
    {
      $unwind: "$reviews"
    },
    {
      $match: { "reviews.user": new ObjectId(user) }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $project: {
        _id: 0,
        'reviews._id': 1,
        'reviews.rating': 1,
        'reviews.commentary': 1,
        'reviews.postedAt': 1,
        'productInfo.name': 1,
        'productInfo._id': 1,
        'productInfo.image': 1,
      }
    }
  ];

  const userReviews = await productModel.aggregate(pipeline).exec();

  if (userReviews.length === 0) throw new databaseException("No reviews.");

  return userReviews;
}


export async function postProductReview({ product, user, rating, commentary }) {
  const getProduct = await productModel.findOne({ _id: product }).exec();
  if (!getProduct) throw new databaseException("Product not found.");
  if (getProduct.reviews.some((rev) => rev.user == user))
    throw new validationException("Only one review per product allowed.");
  console.log("user", user);
  const postReview = await productModel
    .findOneAndUpdate(
      { _id: product },
      { $push: { reviews: { user, rating, commentary } } },
      { new: true }
    )
    .populate("reviews.user", "email firstName lastName")
    .exec();
  return postReview.toObject();
}

export async function editProductReview({ product, user, rating, commentary }) {
  const getProduct = await productModel
    .findOne({ _id: product, "reviews.user": user })
    .exec();
  if (!getProduct) throw new databaseException("User review not found.");
  const userReview = getProduct.reviews.find((rev) => rev.user == user);
  const newData = {
    user,
    postedAt: userReview.postedAt,
    editedAt: new Date(),
    rating: rating || userReview.rating,
    commentary: commentary || userReview.commentary,
  };
  const editReview = await productModel
    .findOneAndUpdate(
      { _id: product, "reviews.user": user },
      { $set: { "reviews.$": newData } },
      { new: true }
    )
    .populate("reviews.user", "email firstName lastName")
    .exec();
  return editReview.toObject();
}
// repository/productRepository.js

export async function deleteProductReview({ reviewId, user }) {
  console.log("Producto recuperado:", reviewId);
  try {
    // Verifica que el producto exista
    const product = await productModel.findById(reviewId);
    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    // Verifica que la reseña del usuario exista en ese producto
    const reviewIndex = product.reviews.findIndex(
      (review) => review.user.toString() === user._id.toString()
    );

    if (reviewIndex === -1) {
      throw new Error("Reseña no encontrada.");
    }

    // Elimina la reseña
    product.reviews.splice(reviewIndex, 1);
    await product.save();

    return { message: "Reseña eliminada con éxito." };
  } catch (error) {
    console.error("Error al eliminar la reseña:", error);
    throw error;
  }
}
