const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");
const bcrypt = require("bcrypt");

const UserSession = sequelize.define(
  "user_session",
  {
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña es requerida"
        },
        len: {
          args: [6, 100],
          msg: "La contraseña debe tener al menos 6 caracteres"
        }
      }
    },
    reset_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_code_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_change_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: "user_session",
    hooks: {
      beforeCreate: async (userSession) => {
        if (userSession.password) {
          const salt = await bcrypt.genSalt(10);
          userSession.password = await bcrypt.hash(userSession.password, salt);
        }
      },
      beforeUpdate: async (userSession) => {
        if (userSession.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          userSession.password = await bcrypt.hash(userSession.password, salt);
          userSession.password_change_at = new Date();
        }
      }
    }
  }
);

// Método para comparar contraseñas
UserSession.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para generar código de reset
UserSession.prototype.generateResetCode = function() {
  this.reset_code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Código de 6 caracteres
  this.reset_code_expires = new Date(Date.now() + 60 * 60 * 1000); // Expira en 1 hora
  return this.reset_code;
};

// Método para verificar si el código de reset es válido
UserSession.prototype.isResetCodeValid = function() {
  if (!this.reset_code || !this.reset_code_expires) {
    return false;
  }
  return new Date() < this.reset_code_expires;
};

// Método para limpiar código de reset
UserSession.prototype.clearResetCode = function() {
  this.reset_code = null;
  this.reset_code_expires = null;
};

// Método para registrar login
UserSession.prototype.recordLogin = function() {
  this.last_login = new Date();
  this.status = true; // Activar sesión
};

// Método para logout
UserSession.prototype.recordLogout = function() {
  this.status = false; // Desactivar sesión
};

module.exports = UserSession;