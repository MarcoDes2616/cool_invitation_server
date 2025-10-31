const sequelize = require("../utils/connection");
const Roles = require("../models/Roles");
const Instruments = require("../models/Instruments");
const Markets = require("../models/Markets");
const OperationTypes = require("../models/OperationType");
const SignalStatus = require("../models/SignalStatus");
const initModels = require('../models');
const Users = require("../models/Users");

const role = [{ role_name: "Admin" }, { role_name: "usuario" }];

const markets = [
  { market_name: "Forex" },
  { market_name: "Indices" },
  { market_name: "Cryptomonedas" },
  { market_name: "Commodities" },
  { market_name: "Sintéticos"}
];

const instruments = [
  {instrument_name: "V10", market_id: 5}, 
  {instrument_name: "V25", market_id: 5}, 
  {instrument_name: "V75", market_id: 5}, 
  {instrument_name: "V50", market_id: 5}, 
  {instrument_name: "STEP", market_id: 5}, 
  {instrument_name: "V100", market_id: 5}
]

const operationsTypes = [
  { operation_type_name: "Buy" },
  { operation_type_name: "Sell" },
];

const signalStatus = [
  { signal_status_name: "Activa" },
  { signal_status_name: "Inactiva" },
  { signal_status_name: "Completada" },
  { signal_status_name: "Cancelada" },
  { signal_status_name: "Pendiente" },
  { signal_status_name: "Fallida" },
  { signal_status_name: "Programada" },
]

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
  await Roles.bulkCreate(role);
  await Instruments.bulkCreate(instruments);
  await Markets.bulkCreate(markets);
  await OperationTypes.bulkCreate(operationsTypes);
  await SignalStatus.bulkCreate(signalStatus);
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
