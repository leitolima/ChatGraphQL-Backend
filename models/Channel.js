const { Schema, model } = require('mongoose');

const ChannelSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'messages'
    }]
})

module.exports = model('channels', ChannelSchema);