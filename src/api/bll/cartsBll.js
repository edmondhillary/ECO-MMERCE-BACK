import * as cartRepository from '../repositories/cartsRepo.js';
import * as productsRepository from '../repositories/productsRepo.js';
import { validationException } from '../errors/cartsErrors.js';

async function getCartByUserId(userId) {
  const getCart = await cartRepository.getCartByUserId(userId)
  ;
  return getCart;
}

async function updateCartByUserId(userId, products) {
    await cartRepository.getCartByUserId(userId);
    for (let productObj of products) {
      const { product, quantity } = productObj;
      if (!product) {throw new validationException('Must provide Product Id to update.')};
      if (product && !product.match(/^[a-f\d]{24}$/i)) { throw new validationException('Invalid ID format.') };
      if (!Number.isInteger(quantity)) {throw new validationException(`Quantity must be integer for Product Id ${product}.`)};
      await productsRepository.getById(product);
      await cartRepository.updateCartByUserId(userId, product, quantity);
    }
    const updatedCart = await cartRepository.getCartByUserId(userId);
    return updatedCart;
  }
  

export { getCartByUserId, updateCartByUserId };
