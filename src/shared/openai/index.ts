import path from 'path'
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../../.env')})

const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});

export * from './utils'
export const openai = new OpenAIApi(configuration);
