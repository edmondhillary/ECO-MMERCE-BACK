import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
    },
    unlockToken: {type: String},
    unlockTokenExp:{type: Date} ,
    phone: {
      type: Number,
    },
    loginAttempts: { type: Number, required: true, default: 0 },
    isLocked: { type: Boolean, default: false },
    displayName: {
      type: String,
      get: function () {
        return this?.firstName + " " + this?.lastName;
      },
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true, versionKey: false },
  }
);

const userModel = model("User", userSchema);

export default userModel;
