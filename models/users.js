var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/todo-db');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
mongoose.connect(process.env.MONGO_URL);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var stringField = {
    type: String,
    minlength: 1,
    maxlength: 50
}
var UserSchema = new Schema({
    email: {
        type: String,
        minlength: 1,
        maxlength: 50,
        lowercase: true,
        unique: true
    },
    name: stringField,
    hashed_pwrd: stringField,
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('hashed_pwrd')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.hashed_pwrd, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.hashed_pwrd = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.hashed_pwrd, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.statics.count = function (cb) {
  return this.model('Users').find({}, cb);
}

module.exports = mongoose.model('Users', UserSchema);