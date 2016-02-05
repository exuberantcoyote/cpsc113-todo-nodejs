Trent Tolley's Social Todo app (version 1.0)

to access app on Heroku:

    https://exuberantcoyote-todo-nodejs.herokuapp.com/

to access app on Github:

    https://github.com/exuberantcoyote/cpsc113-todo-nodejs.git

to run server: 
    
    (from cloud9 - not supported in current version because its configured for Heroku)
    MONGO_URL="mongodb://localhost:27017/todo-db" ./node_modules/.bin/nodemon server.js
    
    (from heroku - heroku connection to mongoDB is hard coded)
    ./node_modules/.bin/nodemon server.js