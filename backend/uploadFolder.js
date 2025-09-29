import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./src/config/s3.js";
import dotenv from "dotenv";

dotenv.config();

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload all files from the "LetterCraft" folder into S3
 */
export async function uploadFolder() {
  const folderPath = path.join(process.cwd(), "LetterCraft");
  console.log(`Uploading files from folder: ${folderPath}`);

  const files = fs.readdirSync(folderPath);
  console.log(`Found ${files.length} files.`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    console.log(`Processing file: ${filePath}`);

    if (fs.lstatSync(filePath).isFile()) {
      const fileStream = fs.createReadStream(filePath);

      // Key format: "letters/<category>/<filename>"
      const [letterCategory, ...rest] = file.replace(".docx", "").split(" ");
      const key = `letters/${letterCategory}/${file}`;

      const params = {
        Bucket: BUCKET,
        Key: key,
        Body: fileStream,
        ContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ACL: "private",
      };

      try {
        await s3.send(new PutObjectCommand(params));
        console.log(`✅ Uploaded: ${key}`);
      } catch (err) {
        console.error(`❌ Error uploading ${file}:`, err);
      }
    }
  }
}

// 👉 Call the function here
uploadFolder().catch((err) => {
  console.error("Error running uploadFolder:", err);
});
