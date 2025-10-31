const Roles = require('./Roles');
const Users = require('./Users');
const UserSession = require('./UserSession');


const initModels = () => {
    // USER HASONE RELATIONSHIP WITH USERSESSION
    Users.hasOne(UserSession);
    UserSession.belongsTo(Users);

    // USER BELONGSTO RELATIONSHIP WITH ROLES
    Roles.hasMany(Users);
    Users.belongsTo(Roles);
};

module.exports = initModels;