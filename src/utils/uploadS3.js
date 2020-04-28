import aws from 'aws-sdk';

const storageS3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.WS_DEFAULT_REGION,
});

const uploadFile = async (base64, name) => {
  let url = null;

  const base64Data = new Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `GuildImages/${name}`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
  };

  const { Location } = await storageS3.upload(params).promise();
  url = Location;

  return url;
};

export default uploadFile;
