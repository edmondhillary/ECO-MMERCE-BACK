import Router from 'express';
import log from '../../server/log.js';
import * as cartsController from '../controllers/cartsController.js';


const router = Router();

router.get('/', log, cartsController.getCartByUserId); //RUTA COMPROBADA//
router.get('/:userId', log, cartsController.getCartByUserId);//RUTA COMPROBADA//
// router.put('/', log, cartsController.updateCartByUserId);
router.put('/:userId', log, cartsController.updateCartByUserId);

export default router;