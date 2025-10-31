const Users = require('./Users');
const UserSession = require('./UserSession');


const initModels = () => {
    // USER HASONE RELATIONSHIP WITH USERSESSION
    Users.hasOne(UserSession);
    UserSession.belongsTo(Users);
};

module.exports = initModels;