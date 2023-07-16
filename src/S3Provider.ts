import { GetObjectCommand, ListObjectsCommand, ListObjectsCommandInput, ListObjectsV2Command, ListObjectsV2CommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import * as dotenv from 'dotenv'
import { IFile } from './interfaces/IFile'
import { IGetUrl } from './interfaces/IGetUrl'
import { ISignUrl } from './interfaces/ISignUrl'
import { IGetFiles } from './interfaces/IGetFiles'


const defaultError = {
    code: "FILES_STORAGE_ERROR",
    body: "Files storage error. Please contact your administrator.",
    exceptionCode: "BAD_REQUEST"
}

export default class S3Provider {

    constructor() {

    }

    setClient(): S3Client {
        dotenv.config()
        const {
            AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY,
            AWS_SESSION_TOKEN,
            AWS_REGION
        } = process.env


        const s3Client =
            AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ?
                new S3Client({
                    region: AWS_REGION,
                    credentials: {
                        accessKeyId: AWS_ACCESS_KEY_ID,
                        secretAccessKey: AWS_SECRET_ACCESS_KEY,
                        sessionToken: AWS_SESSION_TOKEN,

                    },
                }) : new S3Client({
                    region: AWS_REGION
                })

        return s3Client
    }



    async uploadFile(bucket: string, file: IFile): Promise<any> {
        try {
            let intents = 3
            let error = null
            for (let index = 0; index < intents; index++) {
                try {
                    const data = await this.setClient().send(new PutObjectCommand({
                        Bucket: bucket,
                        Key: file.fileName,
                        Body: Buffer.from(file.body, "base64")
                    }));
                    return data
                } catch (e) {
                    error = e
                    intents = intents - 1
                    console.log("INTENTS REMAIN: " + intents)
                }
            }
            throw error
        } catch (error) {
            console.log(error)
            throw { error: defaultError, errorTrace: error }
        }

    }

    async streamToString(stream: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: any = [];
            stream.on("data", (chunk: any) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
        });

    }

    async getFiles(bucket: string): Promise<IGetFiles[]> {

        try {
            const listObjectsParams: ListObjectsCommandInput = {
                Bucket: bucket,
            };

            const listObjectsResponse: any = await this.setClient().send(new ListObjectsCommand(listObjectsParams));

            let files: IGetFiles[] = [];

            for (const content of listObjectsResponse.Contents || []) {
                if (content.Key) {
                    const getObjectParams = {
                        Bucket: bucket,
                        Key: content.Key,
                    };
                    const getObjectResponse: any = await this.setClient().send(new GetObjectCommand(getObjectParams));
                    const bodyContents = await this.streamToString(getObjectResponse.Body);
                    files.push({ key: content.Key, body: bodyContents });
                }
            }

            return files
        } catch (error) {
            console.log(error)
            throw {
                error: defaultError,
                errorTrace: error
            }
        }

    }

    async getUrl(args: IGetUrl): Promise<string> {

        try {
            const object = new GetObjectCommand({
                Key: `${args.route}`,
                Bucket: args.bucket,
                ResponseContentType: args.mimeType
            })

            let signed = await this.signUrl({
                expiration: args.expiration || 3600,
                object: object
            })
            return signed
        } catch (error) {
            console.log(error)
            throw {
                error: defaultError,
                errorTrace: error
            }
        }

    }


    async signUrl(args: ISignUrl): Promise<string> {
        try {
            const client: any = this.setClient()
            const sign = await getSignedUrl(client, args.object, { expiresIn: args.expiration })
            return sign
        } catch (error) {
            console.log(error)
            throw {
                error: defaultError,
                errorTrace: error
            }
        }
    }

    async listObjects(bucket: string, key: string): Promise<ListObjectsV2CommandOutput> {
        const client: any = this.setClient()
        const command = new ListObjectsV2Command({

            Prefix: key,
            Bucket: bucket,
        })

        try {
            let exec = await client.send(command)
            return exec
        } catch (error) {
            console.log(error)
            throw {
                error: defaultError,
                errorTrace: error
            }
        }
    }


}


