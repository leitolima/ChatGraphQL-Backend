const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type User{
        id: ID
        name: String
        lastname: String
        username: String
        image: String
    }

    input UserInput{
        name: String
        lastname: String
        username: String
        password: String
    }

    type Query{
        getUser: User
    }
    
    type Mutation {
        logIn(input: UserInput): User
        createNewUser(input: UserInput): Boolean
    }
`;

module.exports = typeDefs;