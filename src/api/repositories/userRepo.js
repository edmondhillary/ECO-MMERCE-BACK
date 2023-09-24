import userModel from "../models/userSchema.js";
import { Types } from "mongoose";
import { validationException } from "../errors/productErrors.js";
const { ObjectId } = Types;

async function insert({ email, password, firstName, lastName }) {
  const user = await userModel.create({ email, password, firstName, lastName });
  return user;
}

async function getByEmail({ email }) {
  const user = await userModel.findOne({ email });
  return user;
}

async function getAllUsers() {
  const users = await userModel.find({});
  return users;
}

async function updateUser({ id, fieldsToUpdate }) {
  const query = { _id: new ObjectId(id) };
  const updateBody = { $set: fieldsToUpdate };


  const userToUpdate = await userModel.findOneAndUpdate(query, updateBody, {
    new: true,
  });
  return userToUpdate;
}
async function getByUnlockTokenAndExpiration({ unlockToken }) {
  return await userModel.findOne({
    unlockToken,
    unlockTokenExp: { $gt: Date.now() }
  });}
async function getById({ id }) {
  const query = { _id: new ObjectId(id) };
  const user = await userModel.findOne(query);
  return user;
}
async function lockAccount(userId) {
  await userModel.findByIdAndUpdate(userId, { isLocked: true });
}

async function unlockAccount(userId) {
  await userModel.findByIdAndUpdate(userId, { isLocked: false, loginAttempts: 0 });
}

 async function getByUnlockToken(token) {
  try {
    const user = await userModel.findOne({ unlockToken: token });
    console.log('user in getByUnlockTOken REPOSITORY',user)
    return user;
  } catch (err) {
    // Aquí puedes manejar los errores como prefieras
    console.error(`Error while fetching user by unlock token: ${err}`);
    return null;
  }

}
async function deleteUserById({ id }) {
  const query = { _id: new ObjectId(id) };
  const deletedUser = await userModel.findOneAndDelete(query);
  return deletedUser;
}

export { insert, getAllUsers, getByEmail, updateUser, deleteUserById, getById, unlockAccount , lockAccount,getByUnlockTokenAndExpiration, getByUnlockToken};
