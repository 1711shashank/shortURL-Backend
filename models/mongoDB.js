const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require("crypto");

const db_link = "mongodb+srv://admin:1rpV7TSJstEeLJ2w@cluster0.ttoep.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(db_link)
    .then(()=>{
        console.log("db connected");
    }).catch((err)=>{
        console.log(err);
    })


// database stracture
const userSchema = mongoose.Schema({
    name: {
        type: String,
    },
    role:{
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    urlData: [{
        longUrl: String,
        sortUrl: String,
        urlCreatedCount: Number,
        urlUsedCount: Number,
    }]
});

const urlSchema = mongoose.Schema ({
    urlData: [
  {
    longUrl: String,
    sortUrl: String,
    urlCreatedCount: Number,
    urlUsedCount: Number
  }
    ]

})

const urlModel = mongoose.model("urlSchema", urlSchema);
const userDataBase = mongoose.model("userModal", userSchema);
module.exports = { userDataBase, urlModel };
