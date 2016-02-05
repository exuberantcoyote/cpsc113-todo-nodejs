var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todo-db');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    email: String,
    name: String,
    hashed_pwrd: String,
});

UserSchema.statics.count = function (cb) {
  return this.model('Users').find({}, cb);
}

module.exports = mongoose.model('Users', UserSchema);