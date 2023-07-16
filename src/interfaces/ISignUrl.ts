import { GetObjectCommandOutput } from "@aws-sdk/client-s3";

export interface ISignUrl {
    expiration: number,
    object: any
}