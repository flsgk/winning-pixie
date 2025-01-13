import AWS from "aws-sdk";

// AWS S3 설정
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const BUCKET_NAME = process.env.REACT_APP_BUCKET_NAME;

// S3 클라이언트 생성
const s3 = new AWS.S3();

export default s3;
