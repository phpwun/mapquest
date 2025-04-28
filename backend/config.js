const config = {
    port: process.env.PORT || 4000,
    mongoURI: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: '7d',
    minioEndpoint: process.env.MINIO_ENDPOINT || 'minio',
    minioPort: parseInt(process.env.MINIO_PORT) || 9000,
    minioUseSSL: process.env.MINIO_USE_SSL === 'true',
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioBucketName: process.env.MINIO_BUCKET_NAME || 'photos',
    
    // Validate required config
    validate() {
      const required = ['mongoURI', 'jwtSecret', 'minioAccessKey', 'minioSecretKey'];
      for (const prop of required) {
        if (!this[prop]) {
          throw new Error(`Missing required config: ${prop}`);
        }
      }
      return this;
    }
  };
  
  module.exports = config.validate();