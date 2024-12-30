import axios from 'axios';
import {EntityTypes, FieldTypeDefinition, NavItem, NAVITEMS, TypeFieldSchema, Users} from "./types";
import ApiClient, {HttpResponse} from "./ApiClient";
import {fakeFieldData} from "./builder-utils";
import {faker} from '@faker-js/faker/locale/en_US';
import fs from "fs";
import path from "path";

const FormData = require('form-data');
const http = require('http');

interface Creators extends Users {
    cookie?: string[];
    token?: string[];
}

export interface FixtureContext {
    owner: Users;
    time: string;
    cookie?: string;
}

export interface FixtureData {
    entity: EntityTypes;
    context: FixtureContext;
}

type WorldData = { [key: string]: HttpResponse<any>[] }

export class WorldBuilder {
    private apiClient: ApiClient;
    private allCreators: Creators[];
    private fixturePath: string;

    constructor() {
        this.apiClient = new ApiClient();
        this.allCreators = []

        this.fixturePath = path.join(__dirname, '..', '..', 'cypress/cypress/fixtures'); // on local host
        if (!fs.existsSync(this.fixturePath)) {
            console.log(`no such fixture path ${this.fixturePath}`)
            this.fixturePath = '/app/cypress/cypress/fixtures'; // in docker
            if (!fs.existsSync(this.fixturePath)) {
                console.log(`no such fixture path ${this.fixturePath}`)
                this.fixturePath = ''; // ignore
            }
        }
    }

    saveFixture(name: string, entity: any, owner: Users) {
        if (this.fixturePath.length > 0) {
            const data: FixtureData = {
                entity, context: {owner, time: new Date().toISOString()},
            }
            fs.writeFileSync(`${this.fixturePath}/${name}.json`, JSON.stringify(data, null, 2));
        }
        console.log(`User ${owner.username} created a ${entity._type} with these roles ${JSON.stringify(owner.groups)}`)
    }

    serializePayload(entity: any) {
        const headers: any = {}

        let formData: any = null;
        if (typeof entity.hasImage === 'undefined') {
            headers["Content-Type"] = "application/json"
            formData = entity;
        } else {
            delete entity.hasImage;
            formData = new FormData();
            for (let key in entity) {
                if (Array.isArray(entity[key])) {
                    console.log(`appending array ${key} to FormData`)
                    entity[key].forEach((value: any, index: number) => {
                        formData.append(`${key}[${index}]`, value);
                    });
                } else if (entity[key] instanceof Blob || entity[key] instanceof http.IncomingMessage) {
                    console.log(`appending ${key} as file stream `)
                    formData.append(key, entity[key]);
                } else if (typeof entity[key] === 'object' && entity[key] !== null) {
                    console.log(`handle ${entity[key].length} entries for ${key}`)
                    for (let nestedKey in entity[key]) {
                        formData.append(`${key}.${nestedKey}`, entity[key][nestedKey]);
                    }
                } else {
                    // Append other types normally
                    formData.append(key, entity[key]);
                }
            }
            // headers["Content-Type"] = `multipart/form-data`
            Object.assign(headers, formData.getHeaders())
        }


        return {formData, headers};
    }

    public async registerUser(config: any) {
        const baseData = config.base ?? {};
        if (!baseData.password) baseData.password = process.env.REACT_APP_LOGIN_PASS;
        if (!baseData.email) baseData.email = faker.internet.email({
            firstName: baseData.first_name,
            lastName: baseData.last_name
        });
        if (!baseData.username) baseData.username = faker.person.firstName();
        const registered = await this.apiClient.register(baseData);
        if (registered && registered.data) {
            this.saveFixture(`user-add-${registered.data.id}`, registered, registered.data.data.user)
            const profile = await this.updateUserProfile({id: registered.data.data.user.id});
            return profile;
        }
        console.error(registered)
    }

    public async updateUserProfile(user: any) {
        // @ts-ignore
        const entity = await this.populateEntity(user, NAVITEMS.find(nav => nav.type === "Users"))
        const {formData, headers} = this.serializePayload(entity);
        const apiUrl = `${process.env.REACT_APP_API_HOST}/api/users/${user.id}`
        const profile = await this.apiClient.post(apiUrl, formData, headers);
        this.saveFixture(`user-edit-${profile.data.id}`, profile, profile.data)
        return profile.data;
    }

    public async buildObject(item: NavItem) {

        if (typeof TypeFieldSchema[item.type] === 'undefined') {
            console.error('Invalid Type', item)
            return
        }
        const hasUrl = NAVITEMS.find(nav => nav.type === item.type);
        if (!hasUrl) {
            console.error('Invalid URL Type', item)
            return
        }
        if (item.type === "Users") {
            console.error("Use the registerUsers function", item)
            return
        }

        const creator = await this.loadAuthorByRole(null)

        let entity: any = {author: creator.id};
        entity = await this.populateEntity(entity, hasUrl)
        const {formData, headers} = this.serializePayload(entity);

        const apiUrl = `${process.env.REACT_APP_API_HOST}${hasUrl.api}/`
        const response = await this.apiClient.post(apiUrl, formData, headers);
        if (!response.data?.id) {
            console.log(`Error creating ${item.type}. ${response.error}`)
        } else {
            this.saveFixture(`object-add-${hasUrl.type}-${response.data.id}.json`, response.data, creator);
        }
        return response;
    }

    private async populateEntity(entity: any, hasUrl: NavItem) {
        const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[hasUrl.type])
        for (const field of fields) {
            if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                // console.log(`let server handle ${field.field_type}`)
            } else if (field.field_type === 'user_profile' || field.field_type === 'user_account' || field.field_type == 'type_reference' || field.field_type == 'vocabulary_reference') {
                let relType = NAVITEMS.find(nav => nav.type === field.relationship) as NavItem
                const relResponse = await this.apiClient.get(`${process.env.REACT_APP_API_HOST}/api/${relType.segment}/`);
                // @ts-ignore
                if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
                    // @ts-ignore
                    const randomIndex = Math.floor(Math.random() * relResponse.data.results.length);
                    const id = relResponse.data.results[randomIndex].id || relResponse.data.results[randomIndex].slug;
                    if (field.cardinality as number > 1 && Array.isArray(entity[field.machine]) && entity[field.machine].length > 0) {
                        entity[field.machine].push(id)
                    } else if (field.cardinality as number > 1 && relType.type === "Users") {
                        entity[field.machine] = [id]
                    } else {
                        entity[field.machine] = id
                    }
                } else {
                    console.warn(`relationship ${relType.segment} has no data yet`)
                }

            } else if (['image', 'video', 'media'].indexOf(field.field_type) > -1) {
                entity.hasImage = true;
                const mediaUrl = fakeFieldData(field.field_type, field.machine, field.options, hasUrl.plural)
                const mediaResponse = await axios.get(mediaUrl, {responseType: 'stream'});
                if (mediaResponse.status !== 200) {
                    throw new Error(`Failed to fetch ${field.field_type} from ${mediaUrl}`);
                } else {
                    console.log(`Going to load ${mediaUrl}`)
                    entity.hasImage = true;
                    entity[field.machine] = mediaResponse.data;
                }
            } else {
                entity[field.machine] = fakeFieldData(field.field_type, field.machine, field.options, hasUrl.plural)
            }
        }
        return entity;
    }

    async loginUser(email: string = process.env.REACT_APP_LOGIN_EMAIL || '', pass: string = process.env.REACT_APP_LOGIN_PASS || '') {
        const loginResponse = await this.apiClient.login(email, pass)
        if (loginResponse.success) {
            if (typeof loginResponse['cookie'] === 'string') {
                this.apiClient.setCookie(process.env.REACT_APP_API_HOST || "", loginResponse['cookie']);
            }
            console.log(`Login successful: ${loginResponse.data.data.user.username} with cookie ${loginResponse.cookie}`);
        } else {
            console.error('Login failed:', loginResponse.error);
        }
        return loginResponse.data.data.user as Users;
    }

    public async loadAuthor(role: string | null) {
        if (!role) {
            return this.loadAuthorByRole(null);
        }

        // @ts-ignore
        let author = this.allCreators.find(user => user.groups?.indexOf(role) > -1);
        if (author && author.cookie) return author
        if (author && author.email) {
            author = await this.loginUser(author.email) // get cookie
            return author
        }
        if (role === 'superuser') {
            return await this.loginUser();
        }
        author = await this.loadAuthorByRole(role)
        return author;
    }

    public async loadAuthorByRole(role: string | null) {
        const contributors = this.allCreators.length > 0 ? this.allCreators : await this.getContentCreators();
        // @ts-ignore
        let authors = !role ? contributors : contributors.filter(user => user.groups?.indexOf(role) > -1);

        if (!authors.length) {
            console.warn(`FALLING BACK ON SUPERUSER instead of ${role}.`); // TODO: paginate of meta
            const author = await this.loginUser('superuser')
            return author;
        }

        let randomIndex = Math.floor(Math.random() * authors.length);
        let author = authors[randomIndex] as Creators
        console.log(`REUSING CREATOR ${author.username}`);
        if (!author.cookie) {
            author = await this.loginUser(author.email || author.username) // get cookie
        }
        return author;
    }

    public async getContentCreators(offset = 0) {
        const relResponse = await this.apiClient.get(`${process.env.REACT_APP_API_HOST}/api/users/?page_size=300&offset=${offset}`);
        if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
            relResponse.data.results.forEach(((user: Users) => {
                this.allCreators.push(user)
            }))
        }
        return relResponse.data.results as Users[]
    }

}
