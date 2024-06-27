#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import {FieldTypeDefinition, TypeFieldSchema} from "./types";
// import { FieldTypeDefinition, TypeFieldSchema } from "../../templates/reactjs/src/object-actions/types/types";
import {fakeFieldData} from "./builder-utils";

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

    constructor(worldcounts: WorldCount[]) {
        this.worldcounts = worldcounts;
        this.responses = {};
    }

    private async postData(type: string, headers: any, data: any): Promise<ApiResponse> {
        const started = new Date().getTime()
        // headers['Authorization'] = 'Bearer YOUR_TOKEN_HERE';
        const apiUrl = `//${process.env.REACT_APP_API_HOST}/${type}/-1/add`
        try {
            const response = await fetch(apiUrl, {
                body: data,
                method: "POST",
                headers: headers
            });
            const result = await response.json();
            return {success: true, data: result, started: started, ended: new Date().getTime()};
        } catch (error: Error | any) {
            return {success: false, data: error.response ? error.response.data : error.message, started: started, ended: new Date().getTime()};
        }
    }

    public async buildWorld() {
        for (const item of this.worldcounts) {
            for (let i = 0; i < item.count; i++) {
                const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[item.type])
                let hasImage = false;
                const entity: any = {};
                const headers: any = {}
                fields.forEach(field => {
                    if (field.field_type === 'id (auto increment)' || field.field_type === 'slug') {
                        console.log(`let server handle ${field.field_type}`)
                    } else {
                        entity[field.machine] = fakeFieldData(field.field_type)
                        if (['image', 'video', 'media'].indexOf(field.machine) > -1) {
                            hasImage = true;
                        }
                    }
                })

                let formData = null;
                if (hasImage) {
                    formData = new FormData();
                    for(let key in entity) {
                        formData.append(key, entity[key])
                    }
                } else {
                    headers["Content-Type"] = "application/json"
                    formData = JSON.stringify(entity);
                }

                const response = await this.postData(item.type, headers, formData);
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
builder.buildWorld().then(() => {
    console.log(builder.getResponses());
});
