import { Schema, model } from "mongoose";

const cartSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	items: [{
		product: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
		},
		quantity: {
			type: Number,
		},
	}],
}, {
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
}
);

cartSchema.virtual('total').get(function () {
	const total = this.items.reduce((previous, { product, quantity }) => {
		return product.price ? previous + (product.price * quantity) : previous;
	}, 0);
	return total;
})

const cartModel = model("Cart", cartSchema);

export default cartModel;
