const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const {MongoClient} = require('mongodb');
const uri = 'mongodb+srv://Admin:admin123@cluster0.vzs9g.mongodb.net/myDB?retryWrites=true&w=majority';
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const port = process.env.PORT || 3000;
const bcrypt = require('bcryptjs');
app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// connection to DB
mongoose.connect(uri).then((result)=>{
  console.log('connected to Mongo');
}).catch((error)=>{
  console.error('error connecting to Mongo', error);
});

// creating session
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

// routes
app.get('/', (req, res) => {
  client.connect((err) => {
    if (err)
      throw err;
    const mySessions = client.db('myDB').collection('mySessions');
    mySessions.findOne({ _id: req.session.id, 'session.isAuthenticated': true }, (err, userData) => {
      if (err) throw err;
      if(userData) res.render('dashboard', {'message' : 'Welcome ' + userData.session.user.username, 'AlreadyLoggedInMessage': 'You are already logged In'});
      else res.render('index');
    });
  });
});
app.get('/dashboard', (req, res) => {
  res.redirect('/');
});
app.get('/login', (req, res) => {
  res.redirect('/');
});
app.get('/register', (req, res) => {
  client.connect((err) => {
    if (err)
      throw err;
    const mySessions = client.db('myDB').collection('mySessions');
    mySessions.findOne({ _id: req.session.id, 'session.isAuthenticated': true }, (err, userData) => {
      if (err) throw err;
      if(userData) res.render('dashboard', {'message' : 'Welcome ' + userData.session.user.username, 'AlreadyLoggedInMessage': 'You are already logged In'} );
      else res.render('register');
    });
  });
});

// ================================================== login post ======================================================
app.post('/login', (req, res) => {
  console.log(req.body);
  User.findOne({username:req.body.username}, async (err, result) => {
    if (err) throw err;
    console.log(result);
    if (result){
      const isValidPassword = await bcrypt.compare(req.body.password, result.password);
      if(isValidPassword){
        req.session.isAuthenticated = true;
        req.session.user = req.body;
        res.render('dashboard', {message: 'Welcome ' + req.session.user.username});
      }
      else{
        res.render('index', {error: 'Incorrect Password', username: req.body.username});
      }
    }
    else{
      res.render('index', {error: "Username doesn't exist"});
    }
  });
});

// ================================================== logout ======================================================
app.get('/logout', (req, res) =>
{
  req.session.destroy(err =>
    {
      if (err) throw err;
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
});

// ================================================= register ===================================================
app.post('/register', async (req, res) => {
  console.log(req.body);
  let newUser = await User.findOne({email: req.body.email});
  if (newUser){
    return res.render('index', {error: 'You already have an account, sign in now!', username: newUser.username});
  }
  newUser = await User.findOne({username: req.body.username});
  if (newUser){
    return res.render('index', {error: 'You already have an account, sign in now!', username: newUser.username});
  }
  try{
    req.body.password = await bcrypt.hash(req.body.password, 10);
    newUser = new User(req.body);
    await newUser.save();
    req.session.isAuthenticated = true;
    req.session.user = req.body;
    res.render('dashboard', {message: req.session.user.username + ' is successfully registered'});
  }catch(e){
    if (e.message.indexOf('validation failed') !== -1) {
      e = Object.values(e.errors).reduce((a, i)=> a+'<br>'+i);
    }
    return res.render('register', {error: e, username: req.body.username, email:req.body.email });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
