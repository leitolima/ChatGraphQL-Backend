const User = require('../models/User');
const jwt = require('jsonwebtoken');

const resolvers = {
    Mutation: {
        createNewUser: async (_, { input }, { res }) => {
            const { username, password } = input;
            const exists = await User.findOne({username});
            if(exists) throw new Error('This username is already registered');
            const newuser = new User(input);
            newuser.password = await newuser.encryptPassword(password);
            newuser.save();
            const token = jwt.sign({id: newuser._id}, process.env.SECRET_JWT);
            res.cookie('reactchat', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 // 1 day
            });
            return true;
        }
    }
}

module.exports = resolvers;