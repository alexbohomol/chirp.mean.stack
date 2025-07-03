var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  created_at: { type: Date, default: Date.now },
});

var postSchema = new Schema({
  //created_by: { type: Schema.ObjectId, ref: 'User' },
  created_by: String, // TODO: eventually, it must be a relation
  created_at: { type: Date, default: Date.now },
  text: String,
});

mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
