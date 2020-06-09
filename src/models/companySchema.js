import mongoose from '../database';

const CompanySchema = new mongoose.Schema({
  _creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  consuls: { type: String },
  title: {
    type: String,
    unique: true,
    maxlength: 30,
    required: true,
  },
  discord: {
    type: String,
    maxlength: 30,
  },
  governor: {
    type: String,
    unique: true,
    maxlength: 20,
    required: true,
  },
  faction: {
    type: String,
    required: true,
  },
  focus: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  recruting: {
    type: Boolean,
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
    default: 'frsAoAtGpzvWgWO8nLE1.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Company = mongoose.model('Company', CompanySchema);

export default Company;
