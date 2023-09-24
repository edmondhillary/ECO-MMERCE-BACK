import Router from 'express';
import log from '../../server/log.js';
import { isAdmin } from '../auth/auth.controller.js';
import * as ticketController from '../controllers/ticketsController.js';


const router = Router();

router.get('/id/:ticketId', log, isAdmin,  ticketController.getTicketById); 
router.get('/all', log, ticketController.getAllTicketsByUserId);
router.post('/clearcart', log, ticketController.clearCart);//COMPROBADA Y ACTUALIZADA Y ACTUALIZADA LOS DATOS DE STOCK//
router.post('/refund', log, isAdmin,  ticketController.createRefundTicket); 
//RUTA comprobada//

export default router;