#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import {FieldTypeDefinition, TypeFieldSchema} from "./types";
// import { FieldTypeDefinition, TypeFieldSchema } from "../../templates/reactjs/src/object-actions/types/types";
// import {fakeFieldData} from "./builder-utils";
import AuthService from "./AuthService";
import axios from 'axios';
import {fakeFieldData} from "./builder-utils";

// import FormData from 'form-data';
// import * as FormData from 'form-data';

const FormData = require('form-data');
const fs = require('fs');

dotenv.config();

interface WorldCount {
    type: string;
    count: number;
}

interface ApiResponse {
    success: boolean;
    data: any;
    started: number;
    ended: number;
    error?: string;
}

type WorldData = { [key: string]: ApiResponse[] }


export class WorldBuilder {
    private worldcounts: WorldCount[];
    private responses: WorldData;
    private token: string = '';

    constructor(worldcounts: WorldCount[]) {
        this.worldcounts = worldcounts;
        this.responses = {};
    }

    async init() {
        const authService = new AuthService();
        const TOKEN = await authService.authenticate(process.env.REACT_APP_LOGIN_EMAIL || '', process.env.REACT_APP_LOGIN_PASS || '')
        if (typeof TOKEN === 'string') {
            this.token = TOKEN;
            builder.buildWorld().then(() => {
                console.log(builder.getResponses());
            });
        } else {
            console.error(TOKEN)
        }
    }

    private async postData(type: string, data: any, headers: any): Promise<ApiResponse> {
        headers['Authorization'] = `Bearer ${this.token}`;
        const apiUrl = `${process.env.REACT_APP_API_HOST}/api/${type}/`
        const resp:ApiResponse = {success: false, data: 'Unknown Error', started: new Date().getTime(), ended:0};
        try {
            const response = await axios.post(apiUrl, data, {headers: headers});
            resp.data = response.data;
            if (response.status === 200) {
                resp['success'] = true
            }
        } catch (error:any) {
            // throw new Error((error as AxiosError).message)
            resp.data = (error as Error).message;
        }
        resp.ended = new Date().getTime()
        return resp;
    }

    public async buildWorld() {
        for (const item of this.worldcounts) {
            for (let i = 0; i < item.count; i++) {
                const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[item.type])
                let hasImage = false;
                const entity: any = {};
                const headers: any = {
                    'accept': 'application/json'
                }
                fields.forEach(field => {
                    if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                        console.log(`let server handle ${field.field_type}`)
                    } else if (field.field_type === 'type_reference' || field.field_type === 'vocabulary_reference') {
                        console.log("TODO: find from this.responses")
                    } else {
                        entity[field.machine] = fakeFieldData(field.field_type)
                        if (['image', 'video', 'media'].indexOf(field.field_type) > -1) {
                            hasImage = true;
                        }
                    }
                })

                let formData = null;
                if (hasImage) {
                    formData = new FormData();
                    for (let key in entity) {
                        formData.append(key, entity[key])
                    }
                    // headers["Content-Type"] = `multipart/form-data`
                    Object.assign(headers, formData.getHeaders())
                } else {
                    headers["Content-Type"] = "application/json"
                    formData = entity;
                }

                const response = await this.postData(item.type, formData, headers);
                if (typeof this.responses[item.type] === 'undefined') this.responses[item.type] = [];
                this.responses[item.type].push(response);
            }
        }
    }

    public getResponses(): WorldData {
        return this.responses;
    }


}

// Usage example:
const worldcounts: WorldCount[] = [
    {type: 'supplier', count: 3},
    {type: 'ingredient', count: 10},
];
const builder = new WorldBuilder(worldcounts);
builder.init()

