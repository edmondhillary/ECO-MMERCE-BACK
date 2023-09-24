import * as ticketRepository from "../repositories/ticketsRepo.js";
import * as cartRepository from "../repositories/cartsRepo.js";
import * as productRepository from "../repositories/productsRepo.js";
import { validationException } from "../errors/ticketsErrors.js";

async function getTicketById(isAdmin, userId, ticketId) {
  const query = isAdmin ? { _id: ticketId } : { user: userId, _id: ticketId };
  const getTicket = ticketRepository.queryTickets(query);
  return getTicket;
}

async function getAllTicketsByUserId(query) {
  const getTickets = ticketRepository.queryTickets(query);
  return getTickets;
}

async function clearCart(userId, type) {
  const getCart = await cartRepository.getCartByUserId(userId);
  const cartItems = getCart.items;
  if (cartItems.length === 0) {
    throw new validationException("Cart is empty.");
  }
  const { user, items, total } = getCart;

  // Actualiza el stock de los productos y resta la cantidad comprada
  for (const cartItem of cartItems) {
    const productId = cartItem.product._id;
    const quantity = cartItem.quantity;

    // Actualiza el stock del producto restando la cantidad comprada
    await productRepository.updateById(productId, { $inc: { stock: -quantity } });
  }

  // Crea un ticket de compra
  const makeTicket = await ticketRepository.createTicket({
    user,
    items,
    total,
    type,
  });

  // Borra el contenido del carrito del usuario
  await cartRepository.clearCart(userId);

  return makeTicket;
}




async function createRefundTicket(originalTicketId, refundItems) {
  if (!refundItems) {
    throw new validationException("La lista de artículos para reembolso está vacía o es nula.");
  }
  if (!Array.isArray(refundItems)) {
    throw new validationException("refundItems debe ser un array.");
  }
  for (const item of refundItems) {
    if (!item.product || typeof item.product !== 'string') {
      throw new validationException("Cada artículo para reembolso debe tener un ID de producto válido.");
    }
    if (isNaN(item.quantity) || item.quantity < 0) {
      throw new validationException("La cantidad para el reembolso debe ser un número válido y no negativo.");
    }
  }
  try {
    const originalTicket = await ticketRepository.getTicketById({
      _id: originalTicketId,
    });
    console.log(originalTicket.items)
    
    if (!originalTicket) {
      throw new validationException("Ticket original no encontrado.");
    }

    let totalRefund = 0;
    const refundTicketItems = [];

    for (const originalItem of originalTicket.items) {
      const originalProductId = originalItem.product._id.toString();
      const quantityToRefund = refundItems.find(item => item.product === originalProductId)?.quantity || 0;

      // Verificar si la cantidad devuelta excede la cantidad original
      if (originalItem.refundedQuantity + quantityToRefund > originalItem.quantity) {
        throw new validationException(`No puedes devolver más unidades del producto ${originalProductId} de las que se compraron originalmente.`);
      }

      // Actualizar refundedQuantity en el ticket original y obtener el ticket actualizado
      const updatedTicket = await ticketRepository.updateRefundedQuantity(
        originalTicketId,
        originalProductId,
        quantityToRefund
      );
      
      // Verificar si el ticket se actualizó correctamente
      if (!updatedTicket) {
        throw new validationException("Error al actualizar la cantidad devuelta del producto en el ticket original.");
      }

      refundTicketItems.push({
        product: originalProductId,
        quantity: quantityToRefund,
      });

      totalRefund += originalItem.product.price * quantityToRefund;
    }

    // Crear el nuevo ticket de devolución
    const newTicket = {
      user: originalTicket.user._id,
      items: refundTicketItems,
      total: totalRefund,
      type: "refunded",
      relatedTicket: originalTicketId,
    };

    await ticketRepository.updateTicketStatus(originalTicketId, "refunded");
    return await ticketRepository.createTicket(newTicket);

  } catch (error) {
    throw error;
  }
}



export { getTicketById, getAllTicketsByUserId, clearCart, createRefundTicket };
