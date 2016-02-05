var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var stringField = {
    type: String,
    minlength: 1,
    maxlength: 5000
}

var TaskSchema = new Schema({
    owner: ObjectId,
    isOwner: Boolean,  //is currentUser the owner?
    title: stringField,
    description: stringField,
    isComplete: Boolean,
    collaborators: [String]
});

TaskSchema.plugin(autoIncrement.plugin, { model: 'Tasks', field: 'taskId' });

module.exports = mongoose.model('Tasks', TaskSchema);