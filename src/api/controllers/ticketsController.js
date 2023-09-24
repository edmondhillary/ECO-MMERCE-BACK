import * as BLL from '../bll/ticketsBll.js'

async function getTicketById(req, res) {
  const { ticketId } = req.params;
  console.log(req.role)
  const isAdmin = req.role === 'admin';
  const userId = req.user;
  try {
    const getTicket = await BLL.getTicketById(isAdmin, userId, ticketId);
    return res.json(getTicket);
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

async function getAllTicketsByUserId(req, res) {
  const isAdmin = req.role === 'admin';
  const query = isAdmin ? req.query : {user: req.user};
  try {
    const getTickets = await BLL.getAllTicketsByUserId(query);
    return res.json(getTickets);
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

async function clearCart(req, res) {
  const userId = req.user;
  const {type} = req.body
  try {
    const getTicket = await BLL.clearCart(userId, type);
    return res.json(getTicket);
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

async function createRefundTicket(req, res) {
  const { originalTicketId, refundItems } = req.body;
  try {
    const newTicket = await BLL.createRefundTicket(originalTicketId, refundItems);
    return res.json(newTicket);
  } catch(error) {
    return res.status(error.status || 500).json(error.message);
  }
}

export { getTicketById, getAllTicketsByUserId, clearCart, createRefundTicket };
