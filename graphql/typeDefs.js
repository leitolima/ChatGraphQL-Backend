const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type User{
        id: ID
        name: String
        lastname: String
        username: String
        image: String,
        channels: [Channel]
    }

    type Message{
        id: ID
        user: [User]
        text: String
        media: String
    }

    type Channel{
        id: ID
        name: String
        description: String
        creator: User
        members: [User]
        messages: [Message]
    }

    input UserInput{
        name: String
        lastname: String
        username: String
        password: String
    }

    input ChannelInput{
        name: String
        description: String
    }

    type Query{
        getUser: User
        getChannel(id: ID): Channel
    }
    
    type Mutation {
        logIn(input: UserInput): User
        createNewUser(input: UserInput): Boolean
        createNewChannel(input: ChannelInput): Channel
        sendNewMessage(input: String, id: ID): Message
    }
`;

module.exports = typeDefs;