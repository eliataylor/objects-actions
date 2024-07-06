#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import {FieldTypeDefinition, TypeFieldSchema} from "./types";
// import { FieldTypeDefinition, TypeFieldSchema } from "../../templates/reactjs/src/object-actions/types/types";
// import {fakeFieldData} from "./builder-utils";
import ApiClient, {HttpResponse} from "./ApiClient";
import {fakeFieldData} from "./builder-utils";

const FormData = require('form-data');

dotenv.config();

interface WorldCount {
    type: string;
    count: number;
}

type WorldData = { [key: string]: HttpResponse<any>[] }

export class WorldBuilder {
    private worldcounts: WorldCount[];
    private responses: WorldData;
    private apiClient: ApiClient;

    constructor(worldcounts: WorldCount[]) {
        this.worldcounts = worldcounts;
        this.responses = {};
        this.apiClient = new ApiClient();
    }

    async init() {
        const loginResponse = await this.apiClient.login(process.env.REACT_APP_LOGIN_EMAIL || '', process.env.REACT_APP_LOGIN_PASS || '')
        if (loginResponse.success) {
            console.log('Login successful, token: ', loginResponse.data.access_token);
            builder.buildWorld().then(() => {
                const allData = builder.getResponses()
                for (let type in allData) {
                    console.log(`--- ${type} ---- `);
                    console.log(allData[type]);
                }
            });
        } else {
            console.error('Login failed:', loginResponse.error);
        }
    }

    public async buildWorld() {
        for (const item of this.worldcounts) {
            for (let i = 0; i < item.count; i++) {
                if (typeof TypeFieldSchema[item.type] === 'undefined') {
                    break;
                }
                const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[item.type])
                let hasImage = false;
                const entity: any = {};
                const headers: any = {
                    'accept': 'application/json'
                }
                for (const field of fields) {
                    if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                        // console.log(`let server handle ${field.field_type}`)
                    } else if (field.field_type === 'user_profile' || field.field_type === 'user_account' || field.field_type == 'type_reference' || field.field_type == 'vocabulary_reference') {
                        let relType = field.relationship
                        if (relType === 'user_account') relType = 'user';
                        const relResponse = await this.apiClient.get( `${process.env.REACT_APP_API_HOST}/api/${relType}/`);
                        // @ts-ignore
                        if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
                            // @ts-ignore
                            const randomIndex = Math.floor(Math.random() * relResponse.data.results.length);
                            // @ts-ignore
                            entity[field.machine] = relResponse.data.results[randomIndex].id || relResponse.data.results[randomIndex].slug
                        } else {
                            console.warn(`relationship ${relType} has no data yet`)
                        }
                    } else {
                        entity[field.machine] = fakeFieldData(field.field_type, field.machine, field.options)
                        if (['image', 'video', 'media'].indexOf(field.field_type) > -1) {
                            hasImage = true;
                        }
                    }
                }

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

                const apiUrl = `${process.env.REACT_APP_API_HOST}/api/${item.type}/`
                const response = await this.apiClient.post(apiUrl, formData, headers);
                if (typeof this.responses[item.type] === 'undefined') this.responses[item.type] = [];
                this.responses[item.type].push(response);
            }
        }
    }

    public getResponses(): WorldData {
        return this.responses;
    }

}

const worldcounts: WorldCount[] = [
//    {type: 'user', count: 1},
    {type: 'song', count: 1},
    {type: 'venue', count: 1},
    {type: 'event', count: 1},
    {type: 'friendship', count: 1},
    {type: 'playlist', count: 1},
    {type: 'playlist_songs', count: 1},
    {type: 'event_playlists', count: 1},
    {type: 'activity_log', count: 1},
    {type: 'event_checkins', count: 1},
    {type: 'song_requests', count: 1},
    {type: 'likes', count: 1},
];

const builder = new WorldBuilder(worldcounts);
builder.init()