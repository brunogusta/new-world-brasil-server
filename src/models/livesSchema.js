import mongoose from '../database';

const LiveSchema = new mongoose.Schema(
  {
    _creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    liveURL: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default:
        'https://awstest13334565.s3.us-east-2.amazonaws.com/LivesImages/frsAoAtGpzvWgWO8nLE1.jpg',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    imageName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Live = mongoose.model('Live', LiveSchema);

export default Live;
