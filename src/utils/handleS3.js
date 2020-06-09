import aws from 'aws-sdk';

const storageS3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

export const uploadFile = async (base64, imageName, folderName) => {
  let url = null;

  const base64Data = new Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folderName}/${imageName}`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
  };

  const { Location } = await storageS3.upload(params).promise();
  url = Location;

  return url;
};

export const deleteFile = async (imageName, folderName) => {
  let deletedFile = '';

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folderName}/${imageName}`,
  };

  await storageS3.deleteObject(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      deletedFile = data;
      console.log(data);
    }
  });

  return deletedFile;
};
