import { Folder, Document } from "../api/types";
// import { UploadProgress } from "../components/file-folder-upload";
import { v4 as uuidv4 } from "uuid";

export const isFolderType = (obj: Folder | Document): obj is Folder => {
  return obj != null && "path" in obj;
};

export const multiPartUpload = async (
  file: File,
  bucketName: string,
  s3: AWS.S3,
  // updateProgress: (progress: UploadProgress) => void,
) => {
  const random_uuid = uuidv4();
  const createMultipartResponse = await s3
    .createMultipartUpload({
      Bucket: bucketName,
      Key: random_uuid,
    })
    .promise();

  const uploadId = createMultipartResponse.UploadId;
  if (!uploadId) throw new Error("Failed to create multipart upload");

  // in 5 part segments
  const partSize = 5 * 1024 * 1024;
  const numParts = Math.ceil(file.size / partSize);
  const promises = [];

  for (let partNumber = 1; partNumber <= numParts; partNumber++) {
    const start = (partNumber - 1) * partSize;
    const end = Math.min(partNumber * partSize, file.size);
    const blobPart = file.slice(start, end);

    const partPromise = await s3
      .uploadPart({
        Bucket: bucketName,
        Key: random_uuid,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: blobPart,
      })
      .promise();

    promises.push(partPromise);
  }

  const uploadedParts = await Promise.all(promises);

  const completeMultipartUploadParams = {
    Bucket: bucketName,
    Key: random_uuid,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: uploadedParts.map((part, index) => ({
        ETag: part.ETag,
        PartNumber: index + 1,
      })),
    },
  };

  try {
    await s3.completeMultipartUpload(completeMultipartUploadParams).promise();
    // updateProgress({ [file.name]: { progress: 100, success: true } });
    return random_uuid;
  } catch (error) {
    // updateProgress({ [file.name]: { progress: 100, success: false } });
    throw error;
  }
};

export const singleUpload = async (
  file: File,
  bucketName: string,
  s3: AWS.S3,
  // updateProgress: (progress: UploadProgress) => void
) => {
  const random_uuid = uuidv4();
  const params = {
    Bucket: bucketName,
    Key: random_uuid,
    Body: file,
    ContentType: file.type,
  };

  try {
    await s3.upload(params).promise();
    // Return UUID
    return random_uuid;
  } catch (error) {
    throw error;
  }
};
