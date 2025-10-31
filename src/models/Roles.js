const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");

const Roles = sequelize.define(
  "roles",
  {
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Roles;