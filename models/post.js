const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    image:{
     type: String,
    required: true,
    
    },
    title:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
});
Post=mongoose.model('Post', postSchema);
module.exports = Post;