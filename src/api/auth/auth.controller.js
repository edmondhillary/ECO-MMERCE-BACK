import * as authBll from "./auth.bll.js";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepo.js";
import { hashSync } from 'bcrypt';
import bcrypt from 'bcrypt'; 
import { compareSync } from 'bcrypt';
import { authLog } from "./auth.log.js";
import { getTokenInfo, verifyToken } from "./auth.token.js";
import { transporter } from "../config/mailer.js";


export function auth(req, res, next) {
  const { authorization } = req.headers;

  const publicRoutes = [
    (req.url.startsWith('/products') && req.method === 'GET'),
    (req.url.startsWith('/reviews') && req.method === 'GET'),
    (req.url === '/login' && req.method === 'POST'),
    (req.url === '/register' && req.method === 'POST'),
    (req.url.startsWith('/users/unlock-account/') && req.method === 'GET'),
    (req.url.startsWith('/reset-password') && req.method === 'POST') ,
    (req.url.startsWith('/users/resend-unlock-token') && req.method === 'POST'),

  ]

  if (publicRoutes.includes(true)) {
    if (authorization) {
      const { user, role } = getTokenInfo(authorization);
      req.user = user;
      req.role = role;
    };
    return next();
  }

  if (!authorization) {
    authLog(false, 'No auth token');
    return res.status(400).json('Authorization token not found.');
  }

  try {
    const { user, role } = verifyToken(authorization);
    req.user = user;
    req.role = role;
    return next();
  } catch (error) {
    authLog(false, error.message);
    return res.status(error.status || 500).json(error.message);
  }
}

function unauthorized(response) {
  response.status(401);
  response.send(
    "Unauthorized, you are not allow to access this route, ask for permissions "
  );
}

async function login(req, res) {
  const { email, password } = req.body;
  let token;

  if (!email || !password) {
    res.status(400); // Bad request
    res.send("Empty required params");
    return;
  }

  try {
    token = await authBll.login({ email, password });
  } catch (err) {
    // Proporcionamos un código de estado por defecto de 400 si err.status no está definido
    res.status(err.status || 400);
    res.send(err.message || "An error occurred");
    return; // Asegúrate de devolver aquí para evitar enviar múltiples respuestas
  }

  res.json({ token });
}

async function register(req, res) {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    res.status(400).send("Empty required params"); // Bad request
    return;
  }

  try {
    const token = await authBll.register({
      email,
      password,
      firstName,
      lastName,
    });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message); // Puedes cambiar el código de estado según el error
  }
}

export function isAdmin(request, response, next) {
  const token = request.headers.authorization;
  if (!token) {
    return unauthorized(response);
  }

  jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, payload) => {
    if (error) {
      console.error("ERROR!", error.message);
      return unauthorized(response);
    }

    const userRole = payload.role;

    if (userRole === "admin" || userRole === "superAdmin") {
      next();
    } else {
      return unauthorized(response);
    }
  });
}
export function isSuperAdmin(request, response, next) {
  const token = request.headers.authorization;
  if (!token) {
    return unauthorized(response);
  }

  jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, payload) => {
    if (error) {
      console.error("ERROR!", error.message);
      return unauthorized(response);
    }

    if (payload.role !== "superAdmin") {
      return unauthorized(response);
    }

    request.username = payload.username;
    request.userId = payload.userId;
    request.role = payload.role;

    next();
  });
}

// ruta para cambiar la contrasena en config del usaurio // 
export async function passwordRecovery(req, res) {
  const { email } = req.body;
  const user = await userRepo.getByEmail({ email });


  const payload = { userId: user._id, timestamp: Date.now() };
  const token = jwt.sign(payload, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: "7m",
  });

  await transporter.sendMail({
    from: '"Soporte de ecoDent" <eduardog.carbonell@gmail.com>', // sender address
    to: user.email, // list of receivers
    subject: "Restablecimiento de Contraseña", // Subject line
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Restablecimiento de Contraseña</h2>
        <p>Estimado usuario,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de su cuenta. Si usted no realizó esta solicitud, por favor ignore este correo.</p>
        <p>Para restablecer su contraseña, por favor haga clic en el enlace de abajo:</p>
        <a href="http://localhost:3003/users/unlock-account/${user.unlockToken}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
        <p>Atentamente,</p>
        <p>Equipo de Soporte de EcoDent</p>
      </div>
    `
  });

  res.status(203).json({ message: 'Password recovery email sent', token: token });

}

// En tu controller
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  // 1. Buscar el usuario con el token
  const dbUser = await userRepo.getByUnlockToken(token);

  // Validación: Asegurarse de que el token sea válido
  if (!dbUser) {
    return res.status(400).json({ message: 'Invalid token.' });
  }

  // 2. Comprobar la expiración del token
  if (Date.now() > dbUser.unlockTokenExp) {
    return res.status(400).json({ message: 'Token has expired.' });
  }

  // 3. Validar la nueva contraseña
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!regex.test(newPassword)) {
    return res.status(400).json({ message: 'Password should have at least one uppercase letter, one lowercase letter, one number, and one special character.' });
  }

  // Cambiar la contraseña
  const hashedPassword = hashSync(newPassword, 10);
  await userRepo.updateUser({
    id: dbUser._id,
    fieldsToUpdate: {
      password: hashedPassword,
      unlockToken: null,
      unlockTokenExp: null
    },
  });

  return res.status(200).json({ message: 'Password reset successful.' });
}



export async function updatePassword(req, res) {
  const userId = req.userId; // suponiendo que el userId se guarda en el req durante la autenticación
  const { currentPassword, newPassword } = req.body;

  // Validaciones básicas
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new passwords are required." });
  }

  const user = await userRepo.getById(userId);

  // Verificar que la contraseña actual es correcta
  if (!compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: "The current password is incorrect." });
  }

  // Actualizar la contraseña
  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  await userRepo.updateUser({
    id: userId,
    fieldsToUpdate: { password: hashedNewPassword }
  });

  res.json({ message: "Password updated successfully" });
}
export { login, register, resetPassword };
