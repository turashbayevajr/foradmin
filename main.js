//imports
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');


const app = express();
const PORT = process.env.PORT || 7269;

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/uploads'));
//dabase connections 
mongoose.connect('mongodb+srv://randomhero:azharnurda@cluster0.cw0qz.mongodb.net/bilim', {  useNewUrlParser: true,
useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", (error)=>console.log(error));
db.once("open", ()=>console.log("connected to db"));

//middlewares
app.use(express.urlencoded({extended:false}));
mongoose.set('strictQuery', false);
app.use(express.json());

app.use(
    session({
        secret: "qolshatyr",
        saveUninitialized: true,
        resave: false,
        })
);
app.use((req, res, next) => {
res.locals.message=req.session.message;
delete req.session.message;
next();
});

//set template engine
app.set('view engine', 'ejs');

//route prefix
app.use("", require("./routes/routes"));

app.listen(PORT, function () {
    console.log('Server is started on http://127.0.0.1:'+PORT);
  });