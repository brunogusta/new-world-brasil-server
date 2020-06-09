import mongoose from 'mongoose';

mongoose
  .connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch(error => console.log(error));

mongoose.Promise = global.Promise;

module.exports = mongoose;
