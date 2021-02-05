const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('DB has been connected');
    } catch(error) {
        console.log(error);
        process.exit(1);
    }                                                                                           
}

module.exports = connectDB;