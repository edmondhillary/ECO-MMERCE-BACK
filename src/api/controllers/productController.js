import * as BLL from "../bll/productBll.js";
import { validationException } from "../errors/productErrors.js";

export async function getAll(req, res) {
  try {
    const query = req.query;
    const getAllproducts = await BLL.getAll(query);
    return res.json(getAllproducts);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function getAllPage(req, res) {
  try {
    const query = req.query;
    const { page } = req.params;
    const getAllproducts = await BLL.getAllPage(query, page);
    return res.json(getAllproducts);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function search(req, res) {
  try {
    const { search } = req.params;
    const { page } = req.query;
    const searchProducts = await BLL.search(search, page);
    return res.json(searchProducts);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function getById(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json("Must provide a product Id.");

  try {
    const productById = await BLL.getById(id);
    return res.json(productById);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function create(req, res) {
  const role = req.role;
  if (role !== "admin")
    return res.status(401).json("Unauthorized access: only admin route.");

  try {
    const inputs = validateInputs(req.body, "create");
    console.log("Validated Inputs: ", inputs); // Aquí imprimes los inputs validados
    const createdProduct = await BLL.create(inputs);
    console.log("Created Product: ", createdProduct); // Aquí imprimes el producto creado
    return res.json(createdProduct);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function updateById(req, res) {
  const role = req.role;
  if (role !== "admin")
    return res.status(401).json("Unauthorized access: only admin route.");

  const { id } = req.params;
  if (!id) return res.status(400).json("Must provide a product Id.");

  try {
    const inputs = validateInputs(req.body, "update");
    const updatedProduct = await BLL.updateById(id, inputs);
    return res.json(updatedProduct);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function deleteById(req, res) {
  const role = req.role;
  if (role !== "admin")
    return res.status(401).json("Unauthorized access: only admin route.");

  const { id } = req.params;
  if (!id) return res.status(400).json("Must provide a product Id.");

  try {
    const deletedProduct = await BLL.deleteById(id);
    return res.json(deletedProduct);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

function validateInputs(inputs, mode) {
  const { name, price, brand, category, image, tags, stock, user } = inputs;
  switch (mode) {
    case "create":
      if (!tags) throw new validationException("Must provide a tag.");
      if (!stock)
        throw new validationException(
          "Must provide a stock (number of products)"
        );
      if (!name) throw new validationException("Must provide a product name.");
      if (!price || isNaN(price) || price < 0)
        throw new validationException("Must provide a valid product price.");
      if (!brand) throw new validationException("Must provide a brand name.");
      if (!category)
        throw new validationException("Must provide a category name.");
      if (!image)
        throw new validationException("Must provide an image source.");
      return { name, price, brand, category, image, tags, stock };
    case "update":
      //if (!name) throw new validationException('Must provide a product name.');
      if (price && (isNaN(price) || price < 0))
        throw new validationException("Must provide a valid product price.");
      //if (!brand) throw new validationException('Must provide a brand name.');
      //if (!category) throw new validationException('Must provide a category name.');
      //if (!image) throw new validationException('Must provide an image source.');
      return { name, price, brand, category, image, stock, tags };
    case "post-review":
      //if (!name) throw new validationException('Must provide a product name.');
      if (!user) throw new validationException("Must provide an USER.");
      //if (!brand) throw new validationException('Must provide a brand name.');
      //if (!category) throw new validationException('Must provide a category name.');
      //if (!image) throw new validationException('Must provide an image source.');
      return { name, price, brand, category, image, stock, tags, user };
  }
}

export async function getAllReviewsOfProduct(req, res) {
    const { productId } = req.params;
    try {
      const reviews = await BLL.getAllReviewsOfProduct(productId);
      return res.json(reviews);
    } catch (error) {
      return res.status(error.status || 500).json(error.message);
    }
  }
  
  export async function deleteReviewById(req, res) {
    const { reviewId } = req.params;
    const user = req.user;
    const role = req.role || 'user'; // asumir 'user' si el rol no está definido
    try {
      await BLL.deleteReviewById(reviewId, user, role);
      return res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      return res.status(error.status || 500).json(error.message);
    }
  }
export async function getAllReviewsOfUser(req, res) {
  const user = req.user;
  try {
    const getReviews = await BLL.getAllReviewsOfUser(user);
    return res.json(getReviews);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function postProductReview(req, res) {
  const user = req.user;
  const { productId } = req.params;
  const { rating, commentary } = req.body;
  if (productId && !productId.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json("Invalid ID format.");
  }
  if (!rating || isNaN(rating) || rating < 1 || rating > 5)
    return res
      .status(400)
      .json(
        "Must provide rating and be a value between 0 (non-rated) to 5 (max-rating)."
      );
  if (!user) return res.status(400).json("Must provide an USER.").send(console.log(req.user, 'user'));
  try {
    const postReview = await BLL.postProductReview({
      product: productId,
      user,
      rating,
      commentary,
    });
    return res.json(postReview);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function editProductReview(req, res) {
  const user = req.user;
  const { productId } = req.params;
  const { rating, commentary } = req.body;
  if (productId && !productId.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json("Invalid ID format.");
  }
  if (rating && (isNaN(rating) || rating < 1 || rating > 5))
    return res
      .status(400)
      .json(
        "Must provide rating and be a value between 0 (non-rated) to 5 (max-rating)."
      );
  try {
    const editReview = await BLL.editProductReview({
      product: productId,
      user,
      rating,

      commentary,
    });
    return res.json(editReview);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export async function deleteProductReview(req, res) {
  console.log('Dentro del controlador');  
  const user = req.user;
  const { reviewId } = req.params;
  
  if (!reviewId.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json("ID de producto no válido.");
  }
  
  try {
    const deletedReview = await BLL.deleteProductReview({ reviewId, user });
    return res.status(200).json(deletedReview);
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}