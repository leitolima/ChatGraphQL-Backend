const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type User{
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
        default: Boolean
    }

    type Mutation {
        createNewUser(input: UserInput): Boolean
    }
`;

module.exports = typeDefs;