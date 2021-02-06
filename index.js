const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();

const corsOptions = {
    origin: process.env.NODE_ENV == 'production' 
        ? process.env.APP_URL 
        : 'http://localhost:3000',
    credentials: true // <-- REQUIRED backend setting
};

//Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use((req, res, next) => {
    //Checks for token in cookies and adds userId to the requests
    const { reactchat } = req.cookies;
    if (reactchat) {
        const { id } = jwt.verify(reactchat, process.env.SECRET_JWT);
        req.userId = id;
        // console.log('An UserId variable was created in the Req object.');
    } 
    next();
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: req => ({ ...req }),
});

server.applyMiddleware({app, path: '/graphql', cors: false});

app.listen({port: process.env.PORT || 4000}, () => {
    console.log(`Server running on PORT ${process.env.PORT || 4000}`);
})