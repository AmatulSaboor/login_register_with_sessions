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
const uri = 'mongodb+srv://cg-mern-user:UVoso1gryGTswiPz@cluster0.mhwuh.mongodb.net/menproj01?retryWrites=true&w=majority';
const port = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
  req.session.something='abc';
  // console.log(req.session);
  console.log(req.session.id);
  res.render('index');
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
    if(result) res.render('dashboard', {'hello' : 'I am logged in'});
    else res.render('dashboard', {'hello' : 'I am not logged in'});
    console.log(req.session.isAuth);
    req.session.isAuth = true;
    console.log(req.session.isAuth);
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
    await user.save();
  } catch (e) {
    console.log(e);
  }
  res.redirect('/');
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
