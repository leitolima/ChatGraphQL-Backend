const User = require('../models/User');
const jwt = require('jsonwebtoken');

const resolvers = {
    Query: {
        getUser: async (_, args, { req }) => {
            console.log('=> getUser');
            const { reactchat } = req.cookies;
            try{
                const { id } = await jwt.verify(reactchat, process.env.SECRET_JWT);
                const user = await User.findById(id);
                return user;
            } catch (err){
                throw new Error('Invalid token.');
            }
        }
    },

    Mutation: {
        logIn: async (_, { input }, { res }) => {
            console.log('=> logIn');
            const { username, password } = input;
            const auth = await User.findOne({ username });
            if(!auth){
                throw new Error('Username or password incorrect.');
            }
            const passIsCorrect = await auth.validatePassword(password);
            if(!passIsCorrect){
                throw new Error('Username or password incorrect.');
            }
            const token = jwt.sign({id: auth._id}, process.env.SECRET_JWT);
            res.cookie('reactchat', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 // 1 day
            })
            return auth;
        },
        createNewUser: async (_, { input }, { res }) => {
            console.log('=> createNewUser');
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