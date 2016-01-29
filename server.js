// API
var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var Users = require('./models/users.js');


// Configuration
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}))

app.use(function(req, res, next){
  if(req.session.views){
    req.session.views++;
  }else{
    req.session.views=1;
  }
  console.log('This persion visited ' + req.session.views + ' times.')
  next();
})

app.use(function(req, res, next){
  if(req.session.userId){
    Users.findById(req.session.userId, function(err, user){
      if(!err){
        res.locals.currentUser = user;
      }
      next();
    })
  }else{
    next();
  }
})

// Controllers
app.get('/', function (req, res) {
//  res.render('index');
  Users.count(function (err, users) {
    if (err) {
      res.send('error getting users');
    }else{
      res.render('index', {
        userCount: users.length,
        currentUser: res.locals.currentUser
      });
    }
  });
});

app.post('/user/register', function (req, res) {
  if(req.body.password != req.body.password_confirmation){
    return res.render('index', {errors: 'Password does not match'});
  }
  
  var newUser = new Users();
  newUser.hashed_pwrd = req.body.password;
  newUser.email = req.body.email;
  newUser.name = req.body.fl_name;
  newUser.save(function(err, user){
    req.session.userId = user._id;
    //console.log('added new user ' + user)
    if(err){
      res.render('index', {errors: err});
      //res.send('there was an error saving this user');
    }else{
      res.redirect('/');
    }
  })
  
  //res.send(req.body);
});

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT);
});