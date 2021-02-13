const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dspswtipv/image/upload/v1608780067/cihpcvkxc20fmniyltnq.png'
    },
    channels: [{
        type: Schema.Types.ObjectId,
        ref: 'channels',
        default: []
    }],
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'channels',
        default: []
    }],
    created: {
        type: Date,
        default: Date.now()     
    }
});

UserSchema.methods.encryptPassword = async pass=> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt);
}

UserSchema.methods.validatePassword  = function(pass){
    return bcrypt.compare(pass, this.password);
}

module.exports = model('users', UserSchema);