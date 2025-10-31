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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Este nombre de usuario ya está en uso"
      },
      validate: {
        notEmpty: {
          msg: "El nombre de usuario es requerido"
        },
        len: {
          args: [3, 30],
          msg: "El usuario debe tener entre 3 y 30 caracteres"
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
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "El teléfono no puede exceder 20 caracteres"
        }
      }
    },
    sign_declare: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida"
        }
      }
    }
  },
  {
    timestamps: false,
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