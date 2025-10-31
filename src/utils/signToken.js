const jwt = require("jsonwebtoken");
require("dotenv").config();

const signUserToken = (user) => {
    const authToken = jwt.sign({ user }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN,
    });
    return authToken;
}


module.exports = signUserToken;
