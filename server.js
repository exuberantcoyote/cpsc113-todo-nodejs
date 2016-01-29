var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
var Users = require('./models/users.js')

//configure the app
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
//  res.render('index');
  Users.count(function (err, users) {
    if (err) {
      res.send('error getting users');
    }else{
      res.render('index', {userCount: users.length});
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
  newUser.save(function(err){
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