


# s3-files-handler

The s3-files-handler library is a TypeScript class that provides functionality to interact with Amazon S3 using the AWS SDK for JavaScript.


## Methods
The library provides the following methods:

### setClient(): S3Client
Sets up and returns an S3 client based on the configuration provided in the environment variables or using default configuration.

### uploadFile(bucket: string, file: IFile): Promise<any>
Uploads a file to the specified bucket in Amazon S3 using the PutObjectCommand. Returns a Promise that resolves to the upload response.

### streamToString(stream: any): Promise<string>
Converts a readable stream from an S3 object retrieval into a string. Returns a Promise that resolves to the string representation of the stream.

### getFiles(bucket: string): Promise<IGetFiles[]>
Retrieves a list of files from the specified bucket in Amazon S3 using the ListObjectsCommand and GetObjectCommand. Returns a Promise that resolves to an array of files with their key and body contents.

### getUrl(args: IGetUrl): Promise<string>
Generates a pre-signed URL for accessing an object in the specified bucket with the provided route, bucket, and MIME type. Returns a Promise that resolves to the pre-signed URL.

### signUrl(args: ISignUrl): Promise<string>
Generates a pre-signed URL for accessing an object based on the provided expiration time and object information. Returns a Promise that resolves to the pre-signed URL.

### listObjects(bucket: string, key: string): Promise<ListObjectsV2CommandOutput>
Lists objects in the specified bucket with the given key prefix using the ListObjectsV2Command. Returns a Promise that resolves to the output of the list objects operation.

## Usage/Examples

```javascript
import S3Provider from "s3-files-handler";

// Create an instance of the S3Provider class
const s3Provider = new S3Provider();

// Use async/await to interact with Amazon S3

async function example() {
  // Set the S3 client
  const client = await s3Provider.setClient();

  // Use the provided methods to interact with Amazon S3

  // Upload a file to Amazon S3
  const bucket = "YourBucketName";
  const file = {
    fileName: "example.txt",
    body: "This is the content of the file in base 64."
  };

  try {
    const response = await s3Provider.uploadFile(bucket, file);
    console.log("File uploaded:", response);
  } catch (error) {
    console.error("Error uploading file:", error);
  }

  // Get a list of files from Amazon S3
  try {
    const files = await s3Provider.getFiles(bucket);
    console.log("Files retrieved:", files);
  } catch (error) {
    console.error("Error retrieving files:", error);
  }

  // Generate a pre-signed URL for accessing an object
  const getUrlParams = {
    route: "example.txt",
    bucket: bucket,
    mimeType: "text/plain",
    expiration: 3600 // Optional, in seconds
  };

  try {
    const url = await s3Provider.getUrl(getUrlParams);
    console.log("Pre-signed URL:", url);
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
  }

  // Generate a pre-signed URL using object information
  const getObjectParams = {
    Key: "mydocuments/example.txt",
    Bucket: bucket,
  };

  const signUrlParams = {
    object: new GetObjectCommand(getObjectParams),
    expiration: 3600
  };

  try {
    const url = await s3Provider.signUrl(signUrlParams);
    console.log("Pre-signed URL:", url);
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
  }

  // List objects in a bucket with a specific key prefix
  const keyPrefix = "folder/subfolder/";

  try {
    const output = await s3Provider.listObjects(bucket, keyPrefix);
    console.log("List objects output:", output);
  } catch (error) {
    console.error("Error listing objects:", error);
  }
}

example();



```


## Contribution
Contributions are welcome! If you want to improve this package or report any issues, please follow these steps:

#### 1. Fork the repository.

#### 2. Create a new branch 
(git checkout -b feature/feature-name).

#### 3. Make the necessary changes
and commit them (git commit -am 'Add new feature').

#### 4. Push your changes 
to the remote repository (git push origin feature/feature-name).
Open a pull request on GitHub.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE). file for more details.

