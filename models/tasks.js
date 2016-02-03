var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var stringField = {
    type: String,
    minlength: 1
//    maxlength: 500
}

var TaskSchema = new Schema({
    taskId: Number,
    owner: ObjectId,
    isOwner: Boolean,  //is currentUser the owner?
    title: stringField,
    description: stringField,
    isComplete: Boolean,
    collaborators: [String]
});

module.exports = mongoose.model('Tasks', TaskSchema);