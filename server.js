// API
var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
var Users = require('./models/users.js');
var Tasks = require('./models/tasks.js');

// Configuration
var taskCounter = 0;
var store = new MongoDBStore({ 
  uri: process.env.MONGO_URL,
  collection: 'sessions'
});
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// parse cookie, check for existing session with this cookie
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
  store: store
}));

//app.use(function(req, res, next){
//  if(req.session.views){
//    req.session.views++;
//  }else{
//    req.session.views=1;
//  }
//  console.log('This persion visited ' + req.session.views + ' times.')
//  next();
//})

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

// checks if user is logged in
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
    console.log('error1');
    } 
  });
  Tasks.update({ owner: res.locals.currentUser }, { isOwner: true}, { multi: true }, function (err) {
  if (err){
    console.log('error2');
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
    //req.session.userId = user._id;
    if(user && !err){
      req.session.userId = user._id;
      res.redirect('/');
//      console.log("GOOD: " + newUser.name + " " + newUser.email + " " + newUser.hashed_pwrd);
    }else{
      var errormsg = "Error registering user.";
//      if(err){
        if(err.errmsg && err.errmsg.match(/duplicate/)){
          errormsg = 'Account with this email already exists!';
        }
//        console.log("BAD: " + newUser.name + " " + newUser.email + " " + errormsg + " " + newUser.hashed_pwrd);
        return res.render('index', {errors: errormsg});
//      }
    }
  });
});



app.post('/user/login', function (req, res) {
  var user = Users.findOne({email: req.body.email}, function(err, user){
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
  taskCounter+=1;
  newTask.taskId = taskCounter;
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

//  if(req.body.isComplete){
//   console.log(req.body.taskId + 'NOT Complete TO Complete');
//   }else{
//   console.log(req.body.taskId +'Complete TO NOT Complete');
//  }
//  var UpdatedisComplete = [Boolean];
  
//  Tasks.findOne({ taskId: req.body.taskId }, 'title taskId isComplete', function (err, task) {
//    if(err){
//      console.log('error');
//    } 
//    console.log(task.title + task.isComplete);
//    UpdatedisComplete = !task.isComplete;
    //task.isComplete = !task.isComplete;
    //console.log(UpdatedisComplete);
    //Tasks.update({ taskId: task.taskId }, {isComplete: task.isComplete} );
    //Tasks.FindOneAndUpdate({ taskId: req.body.taskId },  {isComplete: task.isComplete});
//  });
  
  Tasks.findOneAndUpdate({ taskId: req.body.taskId },  { isComplete: req.body.changeStatus }, function (err, result) {
    if(err){
      console.log('error');
    } 
//    console.log(result.title + " " + result.isComplete);
    });
//  Tasks.findOne( {taskId: req.body.taskId} ); 
//  Tasks.update( { taskId: req.body.taskId }, { $set: { isComplete: !req.body.isComplete }});
  res.redirect('/');
});
  

app.post('/task/delete', function(req,res){
{$or : [{a: 3}, {b: 4}]}
  //res.locals.currentUser._id;
  //req.session.userId
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