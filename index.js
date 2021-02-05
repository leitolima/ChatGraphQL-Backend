const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();

const typeDefs = gql`
    type Query {
        default: String 
    }
`;

const resolvers = {
    Query: {

    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.applyMiddleware({app, path: '/graphql', cors: false});

app.listen({port: process.env.PORT || 4000}, () => {
    console.log(`Server running on PORT ${process.env.PORT || 4000}`);
})