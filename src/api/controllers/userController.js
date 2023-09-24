import * as usersRepo from '../repositories/userRepo.js';
import bcrypt from 'bcrypt'
import userModel from '../models/userSchema.js';
import { transporter } from '../config/mailer.js';
async function getAllUsers (req, res){
    try{
        const users = await usersRepo.getAllUsers()
        res.json(users);

    }
    catch(error){
        return res.status(error.status || 500).json(err.message)
    }
}

async function updateUser(req, res) {
    const { id } = req.params;
    const fieldsToUpdate = req.body;
  
    // No permitir la actualización del campo de la contraseña desde esta ruta
    if (fieldsToUpdate.password) {
      return res.status(400).json({ error: 'No puedes actualizar la contraseña desde esta ruta. CLICA AQUI PARA ACTUALIZAR CONTRASEÑA' });
    }
  
    try {
      const userUpdated = await usersRepo.updateUser({ id, fieldsToUpdate });
      return res.json(userUpdated);
    } catch (error) {
      return res.status(error.status || 500).json(error.message);
    }
  }
  
  

async function deleteUser(req,res){
    const {id} = req.params;
    try{
        const deletedUser = await usersRepo.deleteUserById({id})
        res.write(`User: ${deletedUser.firstName + ' '+ deletedUser.lastName}  has been deleted`);
        res.end();
    }
    catch(error){
        return res.status(error.status || 500).json(error.message)
    }
}



export async function resendUnlockToken(req, res) {
  const { email } = req.body;
  const dbUser = await usersRepo.getByEmail({ email });
  
  if (!dbUser || !dbUser.isLocked) {
    return res.status(400).send('Account not found or not locked');
  }
  
  const newUnlockToken = `${dbUser._id}${Date.now()}`;
  const newUnlockTokenExp = Date.now() + 7600000; // 1 hora
  
  await usersRepo.updateUser({
    id: dbUser._id,
    fieldsToUpdate: {
      unlockToken: newUnlockToken,
      unlockTokenExp: newUnlockTokenExp,
    },
  });

  // Enviar correo con el nuevo token de desbloqueo
  await transporter.sendMail({
    from: '"Soporte de ecoDent" <eduardog.carbonell@gmail.com>', // sender address
    to: dbUser.email, // list of receivers
    subject: "Nuevo Token de Desbloqueo", // Subject line
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Nuevo Token de Desbloqueo</h2>
        <p>Estimado usuario,</p>
        <p>Has solicitado un nuevo token para desbloquear tu cuenta.</p>
        <p>Para desbloquear tu cuenta, por favor haz clic en el enlace de abajo:</p>
        <a href="http://localhost:3003/users/unlock-account/${newUnlockToken}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Desbloquear Cuenta</a>
        <p>Atentamente,</p>
        <p>Equipo de Soporte de EcoDent</p>
      </div>
    `
  });
  
  return res.status(200).send('New unlock token sent');
}


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

async function updatePassword(req, res) {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  
    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'Cant! be the same password ' });
    }
  // Validar el formato de la nueva contraseña
  if (!newPassword.match(passwordRegex)) {
    return res.status(400).json({ error: 'New password does not meet complexity requirements. REGEX ' });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.findByIdAndUpdate(id, { password: hashedPassword });

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(error.status || 500).json(error.message);
  }
}



async function getAccountUnlocked(req, res) {
  const { token } = req.params;
  console.log('Received token: ', token);

  // Fetch the user by the unlock token
  const dbUser = await usersRepo.getByUnlockToken(token);

  if (!dbUser) {
    console.log('No user found with this unlock token', dbUser);
    return res.status(400).send('Invalid or expired unlock token');
  }

  if (!dbUser.unlockTokenExp) {
    console.log('No expiration time set for this unlock token');
    return res.status(400).send('No expiration time set for this unlock token');
  }

  // Validate if the unlock token has expired
  if (Date.now() > dbUser.unlockTokenExp) {
    console.log('Unlock token has expired');
    return res.status(400).send('Unlock token has expired');
  }

  // Reset login attempts and unlock the account
  const updatedFields = {
    isLocked: false,
    loginAttempts: 0,
    unlockToken: dbUser.unlockToken,
    unlockTokenExp: dbUser.unlockTokenExp,
  };
  await usersRepo.updateUser({ id: dbUser._id, fieldsToUpdate: updatedFields });
  console.log('Account unlocked successfully');
  
  return res.status(200).send('Account unlocked successfully');
}


export {getAllUsers, updateUser, deleteUser, getAccountUnlocked, updatePassword }