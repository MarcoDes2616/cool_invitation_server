// const { getAll, create, getOne, remove, update } = require('../controllers/users.controller');
// const express = require('express');
// const verifyJWT = require('../middlewares/auth.middleware');
// const isAdmin = require('../middlewares/isAdmin.middleware');

// const usersRouter = express.Router();

// usersRouter.route('')
//     .get(verifyJWT, isAdmin, getAll)
//     .post(verifyJWT, isAdmin, create);

// usersRouter.route('/:id')
//     .get(verifyJWT, getOne)
//     .delete(verifyJWT, isAdmin, remove)
//     .put(verifyJWT, isAdmin, update);

// module.exports = usersRouter;