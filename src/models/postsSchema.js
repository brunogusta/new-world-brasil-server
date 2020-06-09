import mongoose from '../database';

const PostsSchema = new mongoose.Schema(
  {
    _creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      maxlength: 30,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default:
        'https://awstest13334565.s3.us-east-2.amazonaws.com/CompaniesImages/frsAoAtGpzvWgWO8nLE1.jpg',
    },
    imageName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', PostsSchema);

export default Post;
