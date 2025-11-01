const express = require('express');
// const usersRouter = require('./users.routes');
const systemRouter = require('./system.routes');
const router = express.Router();

// colocar las rutas aquí
router.use("/system", systemRouter)
// router.use("/users", usersRouter);



module.exports = router;