const catchError = require("../utils/catchError");
const Users = require("../models/Users");
require("dotenv").config();
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sendPushNotification } = require("../utils/notificationService");
const signUserToken = require("../utils/signToken");
const TemporaryRegister = require("../models/TemporaryRegister");
const { sendTokenToRegistrationEmail } = require("../utils/emailsTemplates");

//ENDPOINT SYSTEM 1 -- CREAR REGISTRO TEMPORAL Y ENVIAR EMAIL CON TOKEN
const registerNewUserEmail = catchError(async (req, res) => {
  const { email } = req.body;

  const existingTemporary = await TemporaryRegister.findOne({ 
    where: { email } 
  });

  if (existingTemporary) {
    if (existingTemporary.is_register_completed) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }
    
    // is_register_completed es false, generar nuevo token, actualizar y enviar email
    const newToken = crypto.randomBytes(6).toString("hex").toUpperCase();
    await existingTemporary.update({
      token: newToken,
      updatedAt: new Date()
    });

    await sendEmail({
      to: email,
      subject: "Registro temporal - Tu token de acceso",
      html: sendTokenToRegistrationEmail(newToken),
    });

    return res.status(200).json({
      success: true,
      message: "Registro temporal creado. Revisa tu email para el token de acceso.",
      temporaryRegisterId: existingTemporary.id,
    });
  }

  // flujo regular: no existe registro temporal previo
  const token = crypto.randomBytes(6).toString("hex").toUpperCase();
  const temporaryRegister = await TemporaryRegister.create({
    email,
    token,
  });

  await sendEmail({
    to: email,
    subject: "Registro temporal - Tu token de acceso",
    html: sendTokenToRegistrationEmail(token),
  });

  res.status(200).json({
    success: true,
    message: "Registro temporal creado. Revisa tu email para el token de acceso.",
    temporaryRegisterId: temporaryRegister.id,
  });
});

// ENDPOINT SYSTEM 1.5 -- COMPLETAR REGISTRO DE USUARIO
const verifyEmail = catchError(async (req, res) => {
  const { temporaryRegisterId, token } = req.body;

  const tempRegister = await TemporaryRegister.findByPk(temporaryRegisterId);
  if (!tempRegister) {
    return res.status(404).json({
      success: false,
      message: "Registro temporal no encontrado",
    });
  }

  const user = await Users.create({
    email: tempRegister.email,
    password,
  });

  await tempRegister.destroy();

  res.status(201).json({
    success: true,
    message: "Registro completo",
    user,
  });
});



const sendAuthTokenController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({
      where: {
        email,
        status: true,
      },
    });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Si el email está registrado, recibirás un token de acceso",
      });
    }
    const token = crypto.randomBytes(6).toString("hex").toUpperCase();

    user.login_token = token;
    user.token_expires = new Date(Date.now() + 30 * 60 * 1000);
    user.active_session = false;
    
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Tu token de acceso",
      html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Token de acceso</h2>
                    <p>Utiliza el siguiente código para iniciar sesión:</p>
                    
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <strong style="font-size: 24px; letter-spacing: 3px; color: #000; font-weight: bold;">${token}</strong>
                    </div>
                    
                    <p>Este código es válido por <strong>30 minutos</strong> para su primer uso. Podrás continuar usandolo luego.</p>
                    <p style="font-size: 12px; color: #777;">Si no solicitaste este token, por favor ignora este mensaje.</p>
                </div>
            `,
    });

    res.status(200).json({
      success: true,
      message: "Si el email está registrado, recibirás un token de acceso",
    });
  } catch (error) {
    console.error("Error en sendAuthTokenController:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

//ENDPOINT SYSTEM 2 --- LOGIN
const login = catchError(async (req, res) => {
    const { user } = req;
    
    const lastLogin = new Date();
    await user.update({
        last_login: lastLogin,
        token_expires: new Date(lastLogin.getTime() + 7 * 24 * 60 * 60 * 1000),
        active_session: true
    });

    const authToken = signUserToken(user);
    
    res.status(200).json({
        success: true,
        message: "Autenticación exitosa",
        token: authToken,
        user
    });
});

// ENDPOINT DEL SISTEMA 3 --- OBTENER USUARIO LOGUEADO
const getMe = catchError(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ENDPOINT SYSTEM 4 --- LOGOUT
const logout = catchError(async (req, res) => {
  const user = await Users.findByPk(req.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Usuario no encontrado"
    });
  }

  await user.update({
    last_login: null,
    active_session: false
  });

  res.status(200).json({
    success: true,
    message: "Sesión cerrada exitosamente"
  });
});

// ENDPOINT SYSTEM 5 --- GUARDAR PUSH TOKEN
const savePushToken = async (req, res) => {
  try {
    const { userId, pushToken } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.pushToken = pushToken;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el token push" });
  }
};

// ENDPOINT SYSTEM 6 --- ENVIAR NOTIFICACION PERSONALIZADA
const sendCustomNotification = async (req, res) => {
  try {
    const { title, message, data } = req.body;
    const allUsers = await Users.findAll({
      where: {
        status: true,
        pushToken: {
          [Op.ne]: null,
        },
      },
    });

    const notifications = allUsers.map(async (user) => {
      if (user.pushToken) {
        await sendPushNotification(user.pushToken, title, message, data);
      }
    });
    await Promise.all(notifications);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar notificaciones" });
  }
};

// ENDPOINT SYSTEM 7 --- ELIMINAR PUSH TOKEN
const deletePushToken = async (req, res) => {
  try {;

    const user = await Users.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.pushToken = null;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el token push" });
  }
};

module.exports = {
  registerNewUserEmail,
  verifyEmail,
  login,
  sendAuthTokenController,
  getMe,
  savePushToken,
  sendCustomNotification,
  deletePushToken,
  logout
};
