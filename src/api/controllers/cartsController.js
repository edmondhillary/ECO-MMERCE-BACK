import * as BLL from '../bll/cartsBll.js';

async function getCartByUserId(req, res) {
  const role = req.role;
  const adminRequest = req.params.userId || req.user;
  const userId = role === 'admin' ? adminRequest : req.user;
  if (userId !== undefined && !userId.match(/^[a-f\d]{24}$/i)) { return res.status(400).json('Invalid ID format.') };
  try {
    const getCart = await BLL.getCartByUserId(userId);
    return res.json(getCart);
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

async function updateCartByUserId(req, res) {
	const role = req.role;
	const { products } = req.body;
  if (!products || products.length < 0) {return res.status(400).json('Must provide atleast 1 product.')}
  const adminRequest = req.params.userId || req.user;
  const userId = role === 'admin' ? adminRequest : req.user;
  if (userId !== undefined && !userId.match(/^[a-f\d]{24}$/i)) { return res.status(400).json('Invalid ID format.') };
  try {
    const getCart = await BLL.updateCartByUserId(userId, products);
    return res.json({getCart});
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export { getCartByUserId, updateCartByUserId };
