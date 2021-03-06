var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true
  },
  summary: {
      type:String
  },
  link: {
    type: String,
    required: true
  },
  comments: [
    {
    type: Schema.Types.ObjectId,
    ref: "Comment"
    }
  ]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
