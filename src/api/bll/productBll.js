import * as productsRepository from '../repositories/productsRepo.js';

export async function getAll(query) {
  const getAllProducts = await productsRepository.getAll(query)
  return getAllProducts;
};

export async function getAllPage(query, page) {
  const getAllProducts = await productsRepository.getAllPage(query, page)
  return getAllProducts;
};

export async function search(search, page) {
  const searchProducts = await productsRepository.search(search, page)
  return searchProducts;
};

export async function getById(id) {
  const getProduct = await productsRepository.getById(id);
  return getProduct;
}

export async function create(inputs) {
  const createdProduct = await productsRepository.create(inputs);
  return createdProduct;
}

export async function updateById(id, inputs) {
  const updatedProduct = await productsRepository.updateById(id, inputs);
  return { message: 'Successful update', update: updatedProduct };
}

export async function deleteById(id) {
  const deletedProduct = await productsRepository.deleteById(id);
  return { message: 'Successful deleted', deleted: deletedProduct };
}



export async function getAllReviewsOfProduct(productId) {
  return await productsRepository.getAllReviewsOfProduct(productId);
}

export async function deleteReviewById(reviewId, user, role) {
  return await productsRepository.deleteReviewById(reviewId, user, role);
}


export async function getAllReviewsOfUser(user) {
  const getReviews = await productsRepository.getAllReviewsOfUser(user);
  return getReviews;
}

export async function postProductReview({ product, user, rating, commentary }) {
  const postReview = await productsRepository.postProductReview({ product, user, rating, commentary });
  return postReview;
}

export async function editProductReview({ product, user, rating, title, commentary }) {
  const editReview = await productsRepository.editProductReview({ product, user, rating, title, commentary });
  return editReview;
}

export async function deleteProductReview({ reviewId, user }) {
  try {
    const deletedReview = await productsRepository.deleteProductReview({ reviewId, user });
    return deletedReview;
  } catch (error) {
    throw error;
  }
}