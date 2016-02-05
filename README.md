Trent Tolley's Social Todo app (version 1.0)

to run server: 
    
    (from cloud9 - not supported in current version)
    MONGO_URL="mongodb://localhost:27017/todo-db" ./node_modules/.bin/nodemon server.js
    
    (from heroku - heroku connection to mongoDB is hard coded)
    ./node_modules/.bin/nodemon server.js