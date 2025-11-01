const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");
const bcrypt = require("bcrypt");

const Users = sequelize.define(
  "users",
  {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es requerido"
        },
        len: {
          args: [2, 50],
          msg: "El nombre debe tener entre 2 y 50 caracteres"
        }
      }
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El apellido es requerido"
        },
        len: {
          args: [2, 50],
          msg: "El apellido debe tener entre 2 y 50 caracteres"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Este email ya está registrado"
      },
      validate: {
        isEmail: {
          msg: "Debe ser un email válido"
        },
        notEmpty: {
          msg: "El email es requerido"
        }
      }
    },
    sign_declare: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    telegram_user: {
      type: DataTypes.STRING,
      allowNull: true
    },
    whatsapp_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "El número de WhatsApp no puede exceder 20 caracteres"
        }
      }
    },
  },
  {
    timestamps: true,
    tableName: "users",
    hooks: {
      beforeCreate: (user) => {
        user.created_at = new Date();
      },
      beforeUpdate: (user) => {
        user.updated_at = new Date();
      }
    }
  }
);

// Métodos de instancia útiles
Users.prototype.getFullName = function() {
  return `${this.firstname} ${this.lastname}`;
};

Users.prototype.getContactInfo = function() {
  return {
    email: this.email,
    phone: this.phone,
    whatsapp: this.whatsapp_number,
    telegram: this.telegram_user
  };
};

module.exports = Users;