const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  name: String,
  genre: String,
  directorId: String,
});

module.exports = mongoose.model('Movie', movieSchema);
// module.exports = mongoose.model("Movie", movieSchema, "movies");  // третий параметр это точное название твоей коллекции