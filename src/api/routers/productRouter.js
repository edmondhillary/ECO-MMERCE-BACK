import Router from 'express';
import log from '../../server/log.js';
import { isAdmin } from '../auth/auth.controller.js';
import * as productsController from '../controllers/productController.js'

//todas las RUTAS comprobadas// todo OK!//
//todas las RUTAS comprobadas// todo OK!// 28 AGOSTO 2023`


const productsRouter = Router();

productsRouter.get('/all', log, productsController.getAll); //ruta COMPROBADA//
productsRouter.get('/all/:page', log, productsController.getAllPage);//----MISSING-------------------------------------//
productsRouter.get('/search/:search', log, productsController.search);//----MISSING-----------------------------------------//
productsRouter.post('/create',log, isAdmin,   productsController.create);//ruta COMPROBADA//
productsRouter.get('/id/:id', log, productsController.getById);//ruta COMPROBADA//
productsRouter.put('/id/:id', log,isAdmin, productsController.updateById);//ruta COMPROBADA//
productsRouter.delete('/id/:id', log,isAdmin, productsController.deleteById);//ruta COMPROBADA//
//reviews
productsRouter.get('/reviews/:productId', log, productsController.getAllReviewsOfProduct);//ruta COMPROBADA//
productsRouter.get('/user-reviews', log, productsController.getAllReviewsOfUser);//ruta COMPROBADA//
productsRouter.post('/reviews/:productId', log, productsController.postProductReview);//ruta COMPROBADA//
productsRouter.put('/reviews/:productId', log, productsController.editProductReview);//ruta COMPROBADA//
productsRouter.delete('/reviews/:reviewId',isAdmin,  log, productsController.deleteProductReview); //ruta COMPROBADA//

export default productsRouter;
