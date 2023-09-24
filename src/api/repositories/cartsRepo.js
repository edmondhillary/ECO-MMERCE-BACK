import cartModel from '../models/cartsSchema.js';
import userModel from '../models/userSchema.js';
import productModel from '../models/productSchema.js';
import { databaseLog } from '../../database/database.log.js';
import { databaseException } from '../errors/cartsErrors.js';
import { Types } from "mongoose";
const { ObjectId } = Types;

async function getCartByUserId(userId) {
  const userExists = await userModel.findOne({ _id: userId }).exec()
  if (!userExists) throw new databaseException('User not found.');

  const moreThanOneCart = await cartModel.find({ 'user': userId }).exec();
  if (moreThanOneCart.length > 1) await cartModel.deleteMany({ 'user': userId }).exec();

  const cartExists = await cartModel.findOne({ 'user': userId }).populate('user', 'firstName lastName email').exec();
  if (!cartExists) {
    const newCart = await cartModel.create({ 'user': userId });
    databaseLog('ecoDent', 'carts', 'create', newCart._id);
    return newCart;
  } else {
    await cleanCart(userId);
    const getCart = await cartModel.findOne({ 'user': userId }).
      select('-__v').
      populate('user', 'firstName lastName email').
      populate('items.product', '-__v').
      exec();
    return getCart.toObject();
  }
}

async function updateCartByUserId(userId, product, quantity) {
  if (quantity > 0) {
    const itemExists = await cartModel.findOne({ 'user': userId, 'items.product': product }).exec();
    if (itemExists) {
      const updateItem = await cartModel.findOne({ 'user': userId }).updateOne({ 'items.product': product}, { $set: { 'items.$.quantity': quantity } }).exec();
      databaseLog('ecoDent', 'carts', 'update', updateItem._id);
    } else {
      const updateItem = await cartModel.findOne({ 'user': userId }).updateOne({ $push: { 'items': { product, quantity } } }).exec();
      databaseLog('ecoDent', 'carts', 'update', updateItem._id);
    }
  } else if (quantity <= 0) {
    const deleteItem = await cartModel.findOne({ 'user': userId }).updateOne({ 'items.product': product }, { $pull: { 'items': { product } } }).exec();
    databaseLog('ecoDent', 'carts', 'update', deleteItem._id);
  }
  return await getCartByUserId(userId);
}

async function clearCart(userId) {
  const clearCart = await cartModel.findOne({ 'user': userId }).updateOne({ $set: { 'items': [] } }).exec();
  databaseLog('ecoDent', 'carts', 'update', clearCart._id);
  return clearCart;
}

async function cleanCart(userId) {
  const getCart = await cartModel.findOne({ 'user': userId }).exec();
  const getItems = getCart.items;
  for (let item of getItems) {
    const getItem = await productModel.findOne({ '_id': item.product });
    if (!getItem) await cartModel.findOne({ 'user': userId }).updateOne({ 'items.product': item.product }, { $pull: { 'items': { 'product': item.product } } }).exec();
  }
}

export { getCartByUserId, updateCartByUserId, clearCart };
