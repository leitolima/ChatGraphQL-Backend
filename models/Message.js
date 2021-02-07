const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'channels',
        require: true
    },
    text: {
        type: String,
        require: true
    },
    media: {
        type: String
    }
})

module.exports = model('messages', MessageSchema);