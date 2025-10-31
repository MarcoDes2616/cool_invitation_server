const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const catchError = require("../utils/catchError");

const loginValidator = catchError(async (req, res, next) => {
    const { email, login_token } = req.body;

    const user = await Users.findOne({
        where: {
            email,
            token_expires: { [Op.gt]: new Date() },
            status: true,
        },
    });
    
    if (!user) {
        return res.status(401).json({
            success: false,
            code: 'INACTIVE_USER',
            message: "Usuario inexistente o inactivo",
        });
    }

    if (user?.active_session) {
        return res.status(403).json({
            success: false,
            message: 'Ya existe una sesión activa',
            code: 'SESSION_ACTIVE',
            session: {
                last_login: user.last_login
            }
        });
    }

    const isValid = await bcrypt.compare(login_token, user.login_token);
    if (!isValid) {
        return res.status(401).json({ 
            success: false,
            message: "Credenciales inválidas",
            code: 'INVALID_CREDENTIALS'
        });
    }

    req.user = user;
    next();
});

module.exports = loginValidator;