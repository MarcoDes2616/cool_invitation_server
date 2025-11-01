const catchError = require("../utils/catchError");
const Users = require("../models/Users");
require("dotenv").config();
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sendPushNotification } = require("../utils/notificationService");
const signUserToken = require("../utils/signToken");
const TemporaryRegister = require("../models/TemporaryRegister");
const {
  sendTokenToRegistrationEmail,
  generateWelcomeEmail,
} = require("../utils/emailsTemplates");
const UserSession = require("../models/UserSession");
const generateToken = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
};


//ENDPOINT SYSTEM 1 -- CREAR REGISTRO TEMPORAL Y ENVIAR EMAIL CON TOKEN
const registerNewUserEmail = catchError(async (req, res) => {
  const { email } = req.body;

  const existingTemporary = await TemporaryRegister.findOne({
    where: { email },
  });

  if (existingTemporary) {
    const newToken = generateToken();
    await existingTemporary.update({
      registration_token: newToken,
      updatedAt: new Date(),
    });

    await sendEmail({
      to: email,
      subject: "Registro temporal - Tu token de acceso",
      html: sendTokenToRegistrationEmail(newToken),
    });

    return res.status(200).json({
      success: true,
      message:
        "Registro temporal creado. Revisa tu email para el token de acceso.",
      temporaryRegisterId: existingTemporary.id,
    });
  }

  // flujo regular: no existe registro temporal previo
  const existingUser = await Users.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "El email ya está registrado",
    });
  }

  const registration_token = generateToken();
  const temporaryRegister = await TemporaryRegister.create({
    email,
    registration_token,
  });

  await sendEmail({
    to: email,
    subject: "Registro temporal - Tu token de acceso",
    html: sendTokenToRegistrationEmail(registration_token),
  });

  res.status(200).json({
    success: true,
    message:
      "Registro temporal creado. Revisa tu email para el token de acceso.",
    temporaryRegisterId: temporaryRegister.id,
  });
});

// ENDPOINT SYSTEM 1.5 -- VERIFICAR TOKEN
const verifyEmail = catchError(async (req, res) => {
  const { temporaryRegisterId, registration_token } = req.body;

  // Buscar el registro temporal
  const tempRegister = await TemporaryRegister.findByPk(temporaryRegisterId);
  if (!tempRegister) {
    return res.status(404).json({
      success: false,
      message: "Registro temporal no encontrado",
    });
  }

  // Verificar si el token coincide
  if (tempRegister.registration_token !== registration_token) {
    return res.status(400).json({
      success: false,
      message: "Token de verificación incorrecto",
    });
  }

  // Marcar el registro como verificado
  await tempRegister.update({
    is_verified: true,
  });

  res.status(200).json({
    success: true,
    message:
      "Email verificado correctamente. Puedes continuar con el registro.",
    email: tempRegister.email,
  });
});

// ENDPOINT SYSTEM 1.7 -- COMPLETAR REGISTRO DE USUARIO
const completeRegistration = catchError(async (req, res) => {
  const {
    temporaryRegisterId,
    firstname,
    lastname,
    password,
    telegram_user,
    whatsapp_number,
  } = req.body;

  // Buscar el registro temporal verificado
  const tempRegister = await TemporaryRegister.findOne({
    where: {
      id: temporaryRegisterId,
      is_verified: true,
    },
  });

  if (!tempRegister) {
    return res.status(404).json({
      success: false,
      message: "Registro temporal no encontrado o email no verificado",
    });
  }

  // Crear usuario en la tabla Users
  const user = await Users.create({
    firstname,
    lastname,
    email: tempRegister.email,
    telegram_user: telegram_user || null,
    whatsapp_number: whatsapp_number || null,
    sign_declare: true,
    roleId: 3,
    status: true,
  });

  // Crear sesión de usuario con contraseña
  await UserSession.create({
    userId: user.id,
    password: password,
    is_verified: true,
    status: true,
    last_login: new Date(),
    password_change_at: new Date(),
  });

  // Eliminar el registro temporal
  await tempRegister.destroy();

  // Enviar email de bienvenida
  await sendEmail({
    to: user.email,
    subject: "¡Bienvenido a Cool Invitation!",
    html: generateWelcomeEmail(user.firstname),
  });

  res.status(201).json({
    success: true,
    message: "Registro completado exitosamente",
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    },
  });
});

// Función para template de email de bienvenida

// ENDPOINT SYSTEM 1.9 --- SOLICITAR TOKEN DE AUTENTICACION
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
    active_session: true,
  });

  const authToken = signUserToken(user);

  res.status(200).json({
    success: true,
    message: "Autenticación exitosa",
    token: authToken,
    user,
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
      message: "Usuario no encontrado",
    });
  }

  await user.update({
    last_login: null,
    active_session: false,
  });

  res.status(200).json({
    success: true,
    message: "Sesión cerrada exitosamente",
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
  try {
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
  completeRegistration,
  login,
  sendAuthTokenController,
  getMe,
  savePushToken,
  sendCustomNotification,
  deletePushToken,
  logout,
};
