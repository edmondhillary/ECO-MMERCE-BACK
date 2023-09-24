import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { hashSync ,  compareSync } from "bcrypt";
import * as userRepository from "../repositories/userRepo.js";
import { transporter } from "../config/mailer.js";

// Asegúrate de importar compareSync si no lo has hecho ya

function getToken({ userId, email, role }) {
  const AUTH_EXPIRES_IN = "124h";

  const payload = {
    user: userId,
    email: email,
    role: role,
  };

  const token = jwt.sign(payload, process.env.AUTH_SECRET_KEY, {
    expiresIn: AUTH_EXPIRES_IN,
  });

  return token;
}


async function login({ email, password }) {
  let dbUser = await userRepository.getByEmail({ email });

  if (!dbUser) {
    throw new Error("The email provided is not registered or incorrect. Please check your credentials or register.");
  }

  if (dbUser.isLocked) {
    throw new Error("Your account is locked. Check your email to unlock.");
  }

  const isSamePassword = bcrypt.compareSync(password, dbUser.password);

  if (!isSamePassword) {
    dbUser.loginAttempts++;
    if (dbUser.loginAttempts >= 4) {
      dbUser.isLocked = true;
      const unlockToken = `${dbUser._id}${Date.now()}`;
      dbUser.unlockToken = unlockToken;
      dbUser.unlockTokenExp = Date.now() + 9600000;

      await userRepository.updateUser({
        id: dbUser._id,
        fieldsToUpdate: {
          loginAttempts: dbUser.loginAttempts,
          isLocked: true,
          unlockToken: dbUser.unlockToken,
          unlockTokenExp: dbUser.unlockTokenExp
        }
      });

      await transporter.sendMail({
        from: '"Soporte de ecoDent" <eduardog.carbonell@gmail.com>',
        to: dbUser.email,
        subject: "Restablecimiento de Contraseña",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Restablecimiento de Contraseña</h2>
            <p>Estimado usuario,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de su cuenta. Si usted no realizó esta solicitud, por favor ignore este correo.</p>
            <p>Para restablecer su contraseña, por favor haga clic en el enlace de abajo:</p>
            <a href="http://localhost:3003/users/unlock-account/${unlockToken}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
            <p>Atentamente,</p>
            <p>Equipo de Soporte de EcoDent</p>
          </div>
        `
      });

      throw new Error("Your account has been locked due to multiple failed login attempts. Check your email to unlock.");
    }

    await userRepository.updateUser({
      id: dbUser._id,
      fieldsToUpdate: { loginAttempts: dbUser.loginAttempts }
    });

    throw new Error("The password is incorrect. Please try again.");
  }

  await userRepository.updateUser({
    id: dbUser._id,
    fieldsToUpdate: { loginAttempts: 0 }
  });

  const token = getToken({
    userId: dbUser._id,
    email: dbUser.email,
    role: dbUser.role,
  });

  if (!token) {
    throw new Error("Some problem generating token");
  }

  return token;
}



async function register({ email, password, firstName, lastName }) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  // Validar formato de correo electrónico
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Verificar si el correo electrónico ya está registrado
  const existingUser = await userRepository.getByEmail({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = hashSync(password, 10);
  const dbUser = await userRepository.insert({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });
  if (!dbUser) {
    throw new Error("Some problem at insert");
  }

  const token = getToken({ email: dbUser.email, _id: dbUser._id });
  if (!token) {
    throw new Error("Some problem generating token");
  }

  return token;
}

export { login, register };
