// API
var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL);
var mongoheroku = 'mongodb://webapp:webapp@ds059215.mongolab.com:59215/heroku_spn4kpvw';
mongoose.connect(mongoheroku);
var Users = require('./models/users.js');
var Tasks = require('./models/tasks.js');

// Configuration
var store = new MongoDBStore({ 
//  uri: process.env.MONGO_URL,
  uri: mongoheroku,
  collection: 'sessions'
});
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// parse cookie, check for existing session with this cookie
app.use(session({
//  secret: process.env.SESSION_SECRET,
  secret: 'notsosecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
  store: store
}));

// look up user for this session
app.use(function(req, res, next){
  if(req.session.userId){
    Users.findById(req.session.userId, function(err, user){
      if(!err){
        res.locals.currentUser = user;
      }
      next();
    });
  }else{
    next();
  }
});

// check if user is logged in
function isLoggedIn(req, res, next){
  if(res.locals.currentUser){
    next();
  }else{
    res.sendStatus(403);
  }
}

// load current user's tasks
function loadUserTasks(req, res, next) {
  if(!res.locals.currentUser){
    return next();
  }
  Tasks.update({}, { isOwner: false }, { multi: true }, function (err) {
    if (err){
    } 
  });
  Tasks.update({ owner: res.locals.currentUser }, { isOwner: true}, { multi: true }, function (err) {
    if (err){
    } 
  });
  Tasks.find({}).or([
      {owner: res.locals.currentUser},
      {collaborators: res.locals.currentUser.email}])
    .exec(function(err, tasks){
      if(!err){
        res.locals.tasks = tasks;
      }
      next();
  });
}

// Controllers
// render homepage
app.get('/', loadUserTasks, function (req, res) {
  res.render('index');
});

// handle submitted form for new user
app.post('/user/register', function (req, res) {
  if(req.body.password != req.body.password_confirmation){
    return res.render('index', {errors: 'Password does not match'});
  }
  var newUser = new Users();
  newUser.hashed_pwrd = req.body.password;
  newUser.email = req.body.email;
  newUser.name = req.body.fl_name;
  newUser.save(function(err, user){
    if(user && !err){
      req.session.userId = user._id;
      res.redirect('/');
    }else{
      var errormsg = "Error registering user.";
      if(err.errmsg && err.errmsg.match(/duplicate/)){
        errormsg = 'Account with this email already exists!';
      }
      return res.render('index', {errors: errormsg});
    }
  });
});

app.post('/user/login', function (req, res) {
  Users.findOne({email: req.body.email}, function(err, user){
    if(err || !user){
      res.send('Invalid email address');
      return;
    }
    
    user.comparePassword(req.body.password, function(err, isMatch){
      if(err || !isMatch){
        res.send('Invalid password.');
      }else{
        req.session.userId = user._id;
        res.redirect('/');
      }
    });
  });
});

app.get('/user/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

// Below controllers require user to be logged in
app.use(isLoggedIn);

// Handle submission of form, create new task
app.post('/task/create', function(req, res){
  var newTask = new Tasks();
  newTask.owner = res.locals.currentUser._id;
  newTask.title = req.body.title;
  newTask.description = req.body.description;
  newTask.isComplete = false;
  newTask.isOwner = false;
  newTask.collaborators = [req.body.collaborator1, req.body.collaborator2, req.body.collaborator3];
  newTask.save(function(err, savedTask){
    if(err || !savedTask){
      res.send('Error saving task.');
    }else{
      res.redirect('/');
    }
  });
});

app.post('/task/toggle-complete', function(req,res){
  Tasks.findOneAndUpdate({ taskId: req.body.taskId },  { isComplete: req.body.changeStatus }, function (err, result) {
    if(err){
      console.log('error');
    } 
  });
  res.redirect('/');
});

app.post('/task/delete', function(req,res){
  Tasks.remove({$and : [{taskId: req.body.DeleteId}, {owner: res.locals.currentUser._id}]}, function (err) {
  if (err){
    console.log('error');
    } 
  });
  res.redirect('/');
});

// Start server
app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT);
});