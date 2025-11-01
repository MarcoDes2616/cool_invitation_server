const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");

const TemporaryRegister = sequelize.define(
  "temporary_register",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Ya existe un registro temporal para este email"
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
    registration_token: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: {
          msg: "El token es requerido"
        }
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  },
  {
    timestamps: true, // Para created_at y updated_at automáticos
    tableName: "temporary_register"
  }
);

// Método para marcar como completado
TemporaryRegister.prototype.markAsCompleted = function() {
  this.is_register_completed = true;
  return this.save();
};

module.exports = TemporaryRegister;