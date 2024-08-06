#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import axios from 'axios';
import {Users, TypeFieldSchema, FieldTypeDefinition, NAVITEMS} from "./types";
import ApiClient, {HttpResponse} from "./ApiClient";
import {fakeFieldData} from "./builder-utils";
import {faker} from "@faker-js/faker";

const FormData = require('form-data');

dotenv.config();

interface Creators extends Users {
    cookies?: string[];
}

interface WorldCount {
    type: string;
    count: number;
}

type WorldData = { [key: string]: HttpResponse<any>[] }

export class WorldBuilder {
    private worldcounts: WorldCount[];
    private responses: WorldData;
    private apiClient: ApiClient;
    private superToken: string;
    private contentCreators: Creators[];

    constructor(worldcounts: WorldCount[]) {
        this.worldcounts = worldcounts;
        this.responses = {};
        this.apiClient = new ApiClient();
        this.superToken = ""
        this.contentCreators = []
    }

    async init(email:string, pass:string) {
        const loginResponse = await this.apiClient.login(email, pass)
        if (loginResponse.success) {
            console.log('Login SUPERUSER successful: ', loginResponse.data.data.user.username);
            this.superToken = loginResponse.data

            await builder.getContentCreators();

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

    public async getContentCreators() {
        const relResponse = await this.apiClient.get(`${process.env.REACT_APP_API_HOST}/api/users/?page_size=300`);
        if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
            this.contentCreators = relResponse.data.results as Creators[]; // .results as Creators[]
        }
        console.log("CONTENT CREATORS " + this.contentCreators.length)
    }

    public async buildWorld() {
        for (const item of this.worldcounts) {
            for (let i = 0; i < item.count; i++) {
                if (typeof TypeFieldSchema[item.type] === 'undefined') {
                    console.error('Invalid Type', item)
                    break;
                }
                const hasUrl = NAVITEMS.find(nav => nav.type === item.type);
                if (!hasUrl) {
                    console.error('Invalid URL Type', item)
                    break;
                }

                let randomIndex = Math.floor(Math.random() * this.contentCreators.length);
                const creator = this.contentCreators[randomIndex]
                console.log(`CREATOR ${creator.username}: `);
                if (typeof creator['cookies'] === 'undefined' && typeof creator['username'] === 'string') {
                    const loginResponse = await this.apiClient.login(<string>creator['username'], "1234")
                    if (loginResponse.success) {
                        console.log('Login user successful: ' +  loginResponse.data.data.user.username);
                        this.contentCreators[randomIndex]['cookies'] = this.apiClient.getCookies()
                        creator['cookies'] = this.apiClient.getCookies()
                    }
                }
                if (typeof creator['cookies'] === 'string') {
                    await this.apiClient.setCookies(process.env.REACT_APP_API_HOST || "", creator['cookies']);
                }


                const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[item.type])
                let hasImage = false;
                const entity: any = {author:creator.id};
                const headers: any = {
                    'accept': 'application/json'
                }
                for (const field of fields) {
                    if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                        // console.log(`let server handle ${field.field_type}`)
                    } else if (field.field_type === 'user_profile' || field.field_type === 'user_account' || field.field_type == 'type_reference' || field.field_type == 'vocabulary_reference') {
                        let relType = field.relationship?.toLowerCase()
                        const relResponse = await this.apiClient.get(`${process.env.REACT_APP_API_HOST}/api/${relType}/`);
                        // @ts-ignore
                        if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
                            // @ts-ignore
                            randomIndex = Math.floor(Math.random() * relResponse.data.results.length);
                            // @ts-ignore
                            entity[field.machine] = relResponse.data.results[randomIndex].id || relResponse.data.results[randomIndex].slug
                        } else {
                            console.warn(`relationship ${relType} has no data yet`)
                        }
                    } else if (field.field_type === 'image') {
                        const imageUrl = faker.image.urlLoremFlickr({category: hasUrl.name.toLowerCase()})
                        console.log(`Going to load ${imageUrl}`)
                        const imageResponse = await axios.get(imageUrl, {responseType: 'stream'});
                        if (imageResponse.status !== 200) {
                            throw new Error(`Failed to fetch image from ${imageUrl}`);
                        } else {
                            hasImage = true;

                            // const imageBuffer = Buffer.from(imageResponse.data);
                            entity[field.machine] = imageResponse.data;
                        }
                    } else {

                        entity[field.machine] = fakeFieldData(field.field_type, field.machine, field.options, hasUrl.name)
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

                const apiUrl = `${process.env.REACT_APP_API_HOST}${hasUrl.api}/`
                const response = await this.apiClient.post(apiUrl, formData, headers);
                if (typeof this.responses[item.type] === 'undefined') this.responses[item.type] = [];
                this.responses[item.type].push(response);
                console.log(`Created ${item.type} --- ${JSON.stringify(response.data)}`)
            }
        }
    }

    public getResponses(): WorldData {
        return this.responses;
    }

}

const factor = 30
const worldcounts: WorldCount[] = [
   // {type: 'Songs', count: 1 * factor},
    // {type: 'Events', count: 5 * factor},
    {type: 'Invites', count: 7 * factor},
    {type: 'Playlists', count: 7 * factor},
    {type: 'Friendships', count: 10 * factor},
    {type: 'EventCheckins', count: 6 * factor},
    {type: 'SongRequests', count: 6 * factor},
    {type: 'Likes', count: 8 * factor},
];

const builder = new WorldBuilder(worldcounts);
builder.init(process.env.REACT_APP_LOGIN_EMAIL || '', process.env.REACT_APP_LOGIN_PASS || '')