// DEPENDENCIES
import Router from "express";
import usersRouter from "../api/routers/usersRouter.js";
import * as authController from '../api/auth/auth.controller.js';
import productsRouter from "../api/routers/productRouter.js"; // Importa el controlador necesario
import cartsRouter from "../api/routers/cartsRouter.js";
import ticketsRouter from "../api/routers/ticketsRouter.js";
// ROUTER FILES
import { register, login } from "../api/auth/auth.controller.js";

// ROUTER INITIALIZING
const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post('/password-recovery', authController.passwordRecovery); // Ruta para solicitar la recuperación de la contraseña
router.post('/reset-password/:token', authController.resetPassword); // Ruta para actualizar la contraseña
router.use("/users", usersRouter);
router.use('/products', productsRouter);
router.use('/carts', cartsRouter)
router.use('/tickets', ticketsRouter)


export default router;
