
import { databaseLog } from '../../database/database.log.js';
import { databaseException } from '../errors/ticketsErrors.js';
import ticketModel from '../models/ticketsSchema.js';

import { Types } from "mongoose";
const { ObjectId } = Types;

async function queryTickets(query) {
  const getTicket = await ticketModel.
    find(query).
    select('-__v').
    populate('user', 'email').
    populate('items.product').
    lean().exec();
  if (!getTicket) {throw new databaseException(`Ticket query: [${Object.entries(query)}] returned no entries.`)}
  return getTicket;
}


async function getTicketById(ticketId) {
  try {
    const ticket = await ticketModel
      .findOne({ _id:ticketId })  // Usa findOne con un ObjectId
      .select('-__v')
      .populate('user', 'email')
      .populate('items.product')
      .lean()
      .exec();

    if (!ticket) {
      throw new Error(`No ticket found for ID ${ticketId}`);
    }

    return ticket;
  } catch (error) {
    throw new Error(`An error occurred while fetching the ticket by ID: ${error}`);
  }
}

async function updateTicketStatus(ticketId, newStatus) {
  return await ticketModel.findByIdAndUpdate(ticketId, { status: newStatus }, { new: true });
}
async function createTicket(ticket) {
  const getTicket = await ticketModel.create(ticket);
  databaseLog('ecoDent', 'tickets', 'create', getTicket._id);
  return getTicket;
}

async function updateRefundedQuantity(ticketId, productId, refundQuantity) {
  try {
    const ticket = await ticketModel.findById(ticketId);

    // Encontrar el índice del producto dentro del array 'items'
    const itemIndex = ticket.items.findIndex(item => item.product._id.toString() === productId);
    if (itemIndex === -1) {
      console.log(`No se encontró el ticket con id ${ticketId} y productId ${productId} para actualizar.`);
      return null;
    }

    // Actualizar la cantidad reembolsada
    ticket.items[itemIndex].refundedQuantity += refundQuantity;

    // Guardar el ticket actualizado en la base de datos
    await ticket.save();

    return ticket;
    
  } catch (error) {
    console.log("Error en updateRefundedQuantity: ", error);
    throw error;
  }
}


export { queryTickets, createTicket, updateTicketStatus, updateRefundedQuantity, getTicketById };