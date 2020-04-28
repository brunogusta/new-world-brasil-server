import mongoose from '../database';

const GuildSchema = new mongoose.Schema({
  _creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  consuls: [
    {
      type: String,
    },
  ],
  title: {
    type: String,
    unique: true,
    maxlength: 50,
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
    required: true,
  },
  imageUrl: {
    type: String,
    default: 'url image',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Guild = mongoose.model('Guild', GuildSchema);

export default Guild;
