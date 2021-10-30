/* eslint-disable new-cap */
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const MongoDBStore = require('connect-mongodb-session')(session);
const app = express();
const http = require('http').Server(app);
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const {MongoClient, ObjectId} = require('mongodb');
const uri1 = 'mongodb+srv://cg-mern-user:UVoso1gryGTswiPz@cluster0.mhwuh.mongodb.net/menproj01?retryWrites=true&w=majority';
const uri = 'mongodb+srv://Admin:admin123@cluster0.vzs9g.mongodb.net/myDB?retryWrites=true&w=majority';
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const port = process.env.PORT || 3000;
// const mySessions = 
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect(uri).then((result)=>{
  console.log('connected to Mongo');
}).catch((error)=>{
  console.error('error connecting to Mongo', error);
});

const store = new MongoDBStore({
  uri: uri,
  collection: 'mySessions',
});

app.use(session({
  secret: 'a very secret key',
  resave: false,
  saveUninitialized: false,
  store: store,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  console.log(typeof(req.session.id));
  client.connect(async (err) => {
    if (err) throw err;
    const mySessions = client.db('myDB').collection('mySessions');
    console.log(req.session.id);
    await mySessions.find({_id : req.session.id, 'session.isAuth': true}).toArray( (err, userData) => {
      if (err) throw err;
      console.log(userData);
      if (userData.length > 0){
        console.log(userData);
        res.render('dashboard', {'hello' : 'You are already logged in'})}
      else {
        res.render('index');
      }
    });
  // if (store.find({_id : req.session.id, isAuth: true})){
  //   res.render('dashboard', {'hello' : 'You are already logged in'});
  // }
  // else {
  //   res.render('index');
  // }
  // console.log(req.session);
  // console.log(req.session.id);
  // res.render('index');
});
});

app.get('/dashboard', (req, res) => {


});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  console.log(req.body);
  User.findOne(req.body, (err, result) => {
    if (err) throw err;
    if(result)
      {
        req.session.isAuth = true;
        console.log(req.session.isAuth);
        res.render('dashboard', {'hello' : 'You are logged in'});
      }
    else res.render('dashboard', {'hello' : 'You are not logged in'});
    // console.log(req.session.isAuth);

  });
  
});

app.post('/', (req, res) => {
  console.log(req.body);
  User.findOne(req.body, (err, result) => {
    if (err) throw err;
    if(result)
      {
        req.session.isAuth = true;
        console.log(req.session.isAuth);
        res.render('dashboard', {'hello' : 'You are logged in'});
      }
    else res.render('dashboard', {'hello' : 'You are not logged in'});
  // User.findOne(req.body, (err, result) => {
  //   if (err) throw err;
  //   if(result) res.render('dashboard', {'hello' : 'I am logged in'});
  //   else res.render('dashboard', {'hello' : 'I am not logged in'});
    // console.log(req.session.isAuth);
    // req.session.isAuth = true;
    // console.log(req.session.isAuth);
  });
  
});

app.post('/register', async (req, res) => {
  const {username, email, password} = req.body;

  let user = await User.findOne({email});

  if (user) {
    return res.redirect('/register');
  }

  try {
    // const hashPassword = await bcrypt.hash(password);

    user = new User({
      username,
      email,
      password,
    });
    req.session.isAuth = true;
    console.log(req.session.isAuth);
    await user.save();
  } catch (e) {
    console.log(e);
  }
  res.redirect('/');
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
