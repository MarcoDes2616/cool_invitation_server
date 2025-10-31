const sequelize = require("../utils/connection");
const initModels = require('../models');
const Users = require("../models/Users");

const role = [{ role_name: "Admin" }, { role_name: "usuario" }];

const usersData = [
  {
    firstname: "Marco",
    lastname: "Cardenas",
    username: "marcoc",
    email: "marco2616@gmail.com",
    role_id: 1,
    sign_declare: true,
    created_at: new Date("2025-01-15T10:00:00Z"),
    status: true,
    telegram_user: "Mrk_als",
  },
  {
    firstname: "Teodocio",
    lastname: "Peraza",
    username: "teo",
    email: "teo1344@gmail.com",
    role_id: 1,
    sign_declare: true,
    created_at: new Date("2025-03-20T08:15:00Z"),
    status: true,
    telegram_user: "Tradingsinfrontera",
  },
];

async function seedCreate() {
  await Users.bulkCreate(usersData);
}


initModels()
sequelize
  .sync({ force: true })
  .then(async () => {
    await seedCreate();
    console.log("Seeding completed successfully.");
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
