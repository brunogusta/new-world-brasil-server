const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(error => console.log(error));

mongoose.Promise = global.Promise;

module.exports = mongoose;
