import express from 'express';
import * as userController from '../controllers/userController.js'
import { isAdmin, isSuperAdmin } from '../auth/auth.controller.js';



const router = express.Router();
router.get('/all', userController.getAllUsers ) //ruta COMPROBADA//
router.put('/id/:id', userController.updateUser) //ruta COMPROBADA//
router.delete('/id/:id',isAdmin,  userController.deleteUser); //ruta COMPROBADA//

//CAMBIAR CONTRASEÑA DESDE CONFIG USAURIO // 
router.put('/update-password/:id', userController.updatePassword);//ruta COMPROBADA y volver a hacer login, todo flujo OK// 



//RECUPERACION DE CUENTA BLOQUEADA// 
router.get('/unlock-account/:token', userController. getAccountUnlocked) //ruta COMPROBADA//
router.post('/resend-unlock-token', userController.resendUnlockToken);//ruta COMPROBADA//

  
export default router
