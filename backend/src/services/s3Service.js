// services/s3Service.js
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

class S3Service {
  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original file name
   * @param {string} mimeType - File MIME type
   * @param {string} folder - S3 folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(fileBuffer, originalName, mimeType, folder = "clients") {
    try {
      const fileExtension = originalName.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "private", // Files are private by default
      };

      const result = await s3.upload(params).promise();

      return {
        fileName,
        s3Key: result.Key,
        originalName,
        mimeType,
        size: fileBuffer.length,
        location: result.Location,
      };
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Get signed URL for file access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: expiresIn,
      };

      return await s3.getSignedUrlPromise("getObject", params);
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      };

      return await s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} File existence
   */
  async fileExists(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      };

      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  }
}

export default new S3Service();
