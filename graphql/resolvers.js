const User = require('../models/User');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const pubsub = require('../pubsub');
const { withFilter } = require('apollo-server-express');

const getIdUserAutenticated = req => {
    const { reactchat } = req.cookies;
    const { id } = jwt.verify(reactchat, process.env.SECRET_JWT);
    return id
}

const resolvers = {
    Query: {
        getUser: async (_, args, { req }) => {
            console.log('=> getUser');
            try{
                const id = getIdUserAutenticated(req);
                const user = await User.findById(id).populate('channels favorites');
                return user;
            } catch (err){
                throw new Error('Invalid token.');
            }
        },
        getChannel: async (_, { id }) => {
            console.log('=> getChannel');
            try{
                const channel = await Channel.findById(id).populate('creator members');
                return channel;
            } catch(err){
                throw new Error('This channel not exists.');
            }
        },
        getMessages: async(_, { id }) => {
            console.log('=> getMessages');
            try{
                const messages = await Message.find({channel: id}).populate('user');
                return messages
            } catch(err){
                throw new Error('Unexpected error');
            }
        }
    },

    Mutation: {
        logIn: async (_, { input }, { req, res }) => {
            console.log('=> logIn');
            const { username, password } = input;
            const auth = await User.findOne({ username }).populate('channels favorites');
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
            console.log(req.cookies);
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
        },
        createNewChannel: async (_, { input }, { req }) => {
            console.log('=> createNewChannel');
            const id = getIdUserAutenticated(req);
            const channel = new Channel(input);
            channel.creator = id;
            channel.members.push(id);
            channel.save();
            const { _id: channelId } = channel;
            const user = await User.findOne({_id: id});
            user.channels.push(channelId);
            user.save();
            return channel;
        },
        sendNewMessage: async (_, { input, id: channel_id }, { req }) => {
            console.log('=> sendNewMessage');
            const id = getIdUserAutenticated(req);
            var channel = await Channel.findOne({_id: channel_id});
            const message = new Message({
                user: id,
                channel: channel_id,
                text: input
            });
            message.save();
            channel.messages.push(message._id);
            channel.save();
            await message.populate('user', 'username image').execPopulate();        
            pubsub.publish('MESSAGE_SENT', {
                newMessage: message
            });
            return message;
        },
        joinToChannel: async (_, { id: channel_id }, { req }) => {
            console.log('=> joinToChannel');
            const id = getIdUserAutenticated(req);
            var user = await User.findOne({_id: id});
            var channel = await Channel.findOne({_id: channel_id});
            channel.members.push(id);
            channel.save();
            user.channels.push(channel._id);
            user.save();
            return channel;
        },
        goOutFromChannel: async (_, { id: channel_id }, { req }) => {
            console.log('=> goOutFromChannel');
            const id = getIdUserAutenticated(req);
            var user = await User.findOne({_id: id});
            const newArr = user.channels.filter(ch => ch != channel_id);
            user.channels = newArr;
            user.save();
            return true;
        },
        addToFavorites: async (_, { id: channel_id }, { req }) => {
            console.log('=> addToFavorites');
            const id = getIdUserAutenticated(req);
            var user = await User.findOne({_id: id});
            user.favorites.push(channel_id);
            user.save();
            return true;
        },
        deleteFromFavorites: async (_, { id: channel_id }, { req }) => {
            console.log('=> deleteFromFavorites');
            const id = getIdUserAutenticated(req);
            var user = await User.findOne({_id: id});
            const newArr = user.favorites.filter(ch => ch != channel_id);
            user.favorites = newArr;
            user.save();
            return true;
        },
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(['MESSAGE_SENT']),
                (payload, variables) => {
                    return (payload.newMessage.channel == variables.channel)
                }
            )
        },
    },
}

module.exports = resolvers;