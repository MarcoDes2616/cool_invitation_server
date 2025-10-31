const jwt = require('jsonwebtoken');
const Users = require("../models/Users");
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!authHeader?.startsWith('Bearer ') || !token) {
        return res.status(401).json({ 
            code: 'TOKEN_REQUIRED', 
            message: 'Token de autenticación no proporcionado' 
        });
    }

    try {
        const { user: userData, iat } = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await Users.findOne({
            where: { id: userData.id, status: true }
        });

        if (!user || !user.status) {
            return res.status(401).json({
                code: 'USER_NOT_FOUND',
                message: 'Usuario no existe o está inactivo'
            });
        }

        const lastLoginSeconds = Math.floor(new Date(user.last_login).getTime() / 1000);

        if (iat < lastLoginSeconds) {
            return res.status(401).json({
                code: 'SESSION_EXPIRED',
                message: 'Sesión inválida. Por favor inicie sesión nuevamente'
            });
        }

        req.userRole = userData.role_id;
        req.iat = iat;
        req.user = userData;
        req.userId = userData.id;
        next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError' 
            ? 'Token expirado' 
            : 'Token inválido';
            
        res.status(401).json({ 
            code: 'INVALID_TOKEN', 
            message 
        });
    }
};

module.exports = verifyJWT;