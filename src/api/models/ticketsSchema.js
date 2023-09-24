import { Schema, model } from "mongoose";

const ticketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Object,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
        refundedQuantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    type: {
      type: String,
      enum: ["active", "cancelled", "refunded"],
      required: true,
      default: "active",
    },
    relatedTicket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: false,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ticketModel = model("Ticket", ticketSchema, "tickets");

export default ticketModel;
