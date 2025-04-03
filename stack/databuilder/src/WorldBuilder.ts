import { ModelType, FieldTypeDefinition, NavItem, NAVITEMS, TypeFieldSchema, Users, ModelName } from "./types";
import ApiClient, {HttpResponse} from "./ApiClient";
import fs from "fs";
import path from "path";
import {en, Faker} from '@faker-js/faker';
import {fakeFieldData, imageArrayBuffer} from "./builder-utils.ts";
import * as http from "node:http";
import FormData from "form-data";

const faker = new Faker({
    locale: [en],
});

interface Creators extends Users {
    cookie?: string;
    token?: string;
}

export interface FixtureContext {
    owner: Creators;
    time: string;
    cookie?: string;
    url?: string;
}

export interface FixtureData {
    sent: ModelType<ModelName>;
    received: ModelType<ModelName>;
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

        this.fixturePath = path.resolve('..', 'cypress/cypress/fixtures'); // on local host
        if (!fs.existsSync(this.fixturePath)) {
            this.fixturePath = '/app/databuilder/fixtures';
            if (!fs.existsSync(this.fixturePath)) {
                fs.mkdirSync(this.fixturePath);
                console.log(`Created fixture storage ${this.fixturePath}`)
            }
        }
        console.log(`Output will be stored in ${this.fixturePath}`)
    }

    saveFixture(verb: string, url: string, sent: any, received: any, owner: Users) {
        if (this.fixturePath.length > 0) {
            const data: FixtureData = {
                sent,
                received,
                context: {owner, time: new Date().toISOString()},
            }

            for (let key in sent) {
                if (typeof sent[key] === 'object' && sent[key] !== null && 'stream' in sent[key] && typeof sent[key].stream === 'object') {
                    sent[key].stream = sent[key].stream.statusCode
                }
            }

            const parts = url.replace('?', '/').split('/');
            const name: string[] = [verb];
            let hasId = false
            parts.forEach(part => {
                if (part.length > 0 && part !== 'api') {
                    name.push(part);
                    if (parseInt(part) > -1) {
                        hasId = true;
                    }
                }
            })
            if (!hasId) {
                name.push(received.id ?? sent.id)
            }
            console.log(`SAVED: ${name.join('-')} by ${owner?.id || 'unknown'}`)
            fs.writeFileSync(`${this.fixturePath}/${name.join('-')}.json`, JSON.stringify(data, null, 2));
        } else {
            console.warn(`No such fixture path found ${this.fixturePath}.`);
        }
        // console.log(`User ${owner.username} created a ${received._type} with these roles ${JSON.stringify(owner.groups)}`)
    }

    public async registerUser(config: any) {
        const baseData = config.base ?? {};
        if (!baseData.password) baseData.password = process.env.REACT_APP_LOGIN_PASS;
        if (!baseData.first_name) baseData.first_name = faker.person.firstName();
        if (!baseData.last_name) baseData.last_name = faker.person.lastName();
        if (!baseData.email) baseData.email = faker.internet.email({
            firstName: baseData.first_name,
            lastName: baseData.last_name
        });
        if (!baseData.username) baseData.username = faker.person.firstName();
        const registered = await this.apiClient.register(baseData);
        if (registered?.data && registered.data.data.user) {
            const allAuthUser = registered.data.data.user
            this.saveFixture('add', `/api/users/${allAuthUser.id}`, baseData, registered, allAuthUser)

            const user = await this.apiClient.post(`/api/oa-testers/${allAuthUser.id}`, {});
            if (user && user.data) {
                user.data.groups = ['oa-tester']
                this.saveFixture('add', `/api/oa-testers/${allAuthUser.id}`, {}, user, allAuthUser)
                const profile = await this.updateUserProfile({...user.data, ...baseData});
                return profile;
            } else {
                console.error("OA-TESTER GROUP NOT ADDED!", user.data, user.error)
            }
        }
        console.error(registered)
    }

    public async updateUserProfile(user: any) {
        const entity = await this.populateEntity(user, NAVITEMS.find(nav => nav.type === "Users") as NavItem)
        const {formData, headers} = await this.serializePayload(entity);
        const apiUrl = `/api/users/${user.id}?autoverify=true`
        const profile = await this.apiClient.post(apiUrl, formData, headers);
        if (profile && profile.data) {
            this.saveFixture('edit', apiUrl, entity, profile, profile.data)
        } else {
            console.error('profile update failed', profile)
        }
        return profile.data;
    }

    async loginUser(email: string = process.env.REACT_APP_LOGIN_EMAIL || '', pass: string = process.env.REACT_APP_LOGIN_PASS || '') {
        const loginResponse = await this.apiClient.login(email, pass)
        if (loginResponse.success) {
            console.log(`Login successful: ${loginResponse.data.data.user.username} with cookie ${loginResponse.cookie}`);
        } else {
            console.error('Login failed:', loginResponse.error);
        }
        if (loginResponse && loginResponse.data && loginResponse.data.data) {
            return loginResponse.data.data.user as Users;
        }
        return false;
    }

    public async loadAuthorByRole(role: string | null): Promise<Creators | null> {
        const contributors = this.allCreators.length > 0 ? this.allCreators : await this.getContentCreators();
        // @ts-ignore
        let authors = !role ? contributors : contributors.filter(user => user.groups?.indexOf(role) > -1);

        if (!authors.length) {
            console.warn(`FALLING BACK ON SUPERUSER instead of ${role}.`); // TODO: paginate of meta
            const author = await this.loginUser(process.env.REACT_APP_LOGIN_EMAIL!)
            if (!author) return null
            return author;
        }

        let randomIndex = Math.floor(Math.random() * authors.length);
        let author = authors[randomIndex] as Creators
        console.log(`using creator ${author.username}`);
        if (!author.cookie) {
            const works = await this.loginUser(author.email || author.username) // get cookie
            if (works) {
                author = works;
            } else {
                if (`Login failed for ${author.email || author.username}. Removing from creators`)
                    this.allCreators = this.allCreators.filter(user => user.email !== author.email)
                if (this.allCreators.length > 0) {
                    return this.loadAuthorByRole(role)
                }
                return null
            }
        }
        return author;
    }

    public async getContentCreators(offset = 0) {
        const relResponse = await this.apiClient.get(`/api/oa-testers?page_size=300&offset=${offset}`);
        if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
            relResponse.data.results.forEach(((user: Users) => {
                this.allCreators.push(user)
            }))
        }
        return relResponse.data.results as Users[]
    }

    public async buildObject(item: NavItem) {
        if (item.type === "Users") {
            console.error("Use the `registerUsers` function", item)
            return
        }
        const creator = await this.loadAuthorByRole(null);
        if (!creator) {
            return console.warn("Failed to get a oa-tester. run `users-add` to create some first")
        }

        const entity = await this.populateEntity({}, item)
        const {formData, headers} = await this.serializePayload(entity);

        const response = await this.apiClient.post(item.api, formData, headers);
        if (!response.data?.id) {
            console.error(`Error creating ${item.type}. ${response.error}`)
        } else {
            this.saveFixture('add', item.api, formData, response.data, creator);
        }
        return response;
    }

    public async deleteTester(user: Creators) {

        const response = await this.apiClient.delete(`/api/oa-testers/${user.id}`);
        if (response && response.data) {
            this.saveFixture('delete', `/api/oa-testers/${user.id}`, {}, user, user)
        } else {
            console.error("OA-TESTER Not deleted!", user)
        }
        return response;
    }

    private async populateEntity(entity: any, hasUrl: NavItem, overwrite: boolean = false) {
        const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[hasUrl.type])
        if (hasUrl.type === "Users") {
            const tpl: FieldTypeDefinition = {
                "machine": "display_name",
                "singular": "Display Name",
                "plural": "Display Names",
                "field_type": "text",
                "data_type": "string",
                "cardinality": 1,
                "relationship": "Users",
                "default": "",
                "required": false,
                "example": ""
            }
            fields.push({...tpl, ...{machine: 'username'}})
            fields.push({...tpl, ...{machine: 'first_name'}})
            fields.push({...tpl, ...{machine: 'last_name'}})
            fields.push({...tpl, ...{machine: 'email', field_type: 'email'}})
            fields.push({...tpl, ...{machine: 'email', field_type: 'password'}})
        }

        for (const field of fields) {
            if (!overwrite && entity[field.machine]) continue;

            if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                // console.log(`let server handle ${field.field_type}`)
            } else if (this.allCreators.length && (field.field_type === 'user_profile' || field.field_type === 'user_account')) {
                let randomIndex = Math.floor(Math.random() * this.allCreators.length);
                if (field.cardinality as number > 1) {
                    entity[field.machine] = [this.allCreators[randomIndex].id]
                } else {
                    entity[field.machine] = this.allCreators[randomIndex].id
                }
            } else if (field.field_type === 'user_profile' || field.field_type === 'user_account' || field.field_type == 'type_reference' || field.field_type == 'vocabulary_reference') {
                let relType = NAVITEMS.find(nav => nav.type === field.relationship) as NavItem
                const relResponse = await this.apiClient.get(`/api/${relType.segment}/`);
                // @ts-ignore
                if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
                    // @ts-ignore
                    const randomIndex = Math.floor(Math.random() * relResponse.data.results.length);
                    const id = relResponse.data.results[randomIndex].id || relResponse.data.results[randomIndex].slug;
                    if (field.cardinality as number > 1 && Array.isArray(entity[field.machine]) && entity[field.machine].length > 0) {
                        entity[field.machine].push(id)
                    } else if (field.cardinality as number > 1) { //  && relType.type === "Users"
                        entity[field.machine] = [id]
                    } else {
                        entity[field.machine] = id
                    }
                } else {
                    console.warn(`relationship ${relType.segment} has no data yet`)
                }

            } else if (['image', 'video', 'media'].indexOf(field.field_type) > -1) {
                const mediaUrl = await fakeFieldData(field.field_type, field.machine, field.options, hasUrl.plural)
                // const mediaUrl = "https://api.trackauthoritymusic.com/sites/default/files/products/therapruler-book.jpeg"
                // const mediaUrl = "https://live.staticflickr.com/65535/51418651934_309ddab4f2_n.jpg"
                // console.log(`streaming ${mediaUrl}`)
                try {
                    let filename = new URL(mediaUrl).pathname;
                    filename = filename.substring(filename.lastIndexOf('/') + 1)
                    if (filename.indexOf('.') < 0) {
                        filename += '.jpg'
                    }

                    const mediaResponse = {stream: mediaUrl, filename}
                    entity.hasImage = true;
                    entity[field.machine] = mediaResponse
                } catch (e) {
                    console.warn(`Invalid url for ${field.machine}`, field, e)
                }

            } else {
                entity[field.machine] = await fakeFieldData(field.field_type, field.machine, field.options, hasUrl.plural)
            }
        }
        return entity;
    }

    async serializePayload(entity: any): Promise<{ formData: any; headers: any }> {
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
                    if (entity[key].length > 0) {
                        console.log(`appending array ${key} to FormData`)
                        entity[key].forEach((value: any, index: number) => {
                            formData.append(`${key}[${index}]`, value);
                        });
                    }
                } else if (typeof entity[key] === 'object' && entity[key] !== null && 'stream' in entity[key]) {
                    const filename = entity[key].filename || `${key}.jpg`
                    const stream = entity[key].stream
                    if (typeof stream === 'string') {
                        console.log(`Requesting ${stream} for ${key}`);
                        // const imageBlob = await fetchImageAsBlob(stream);
                        // const imageBlob = await getImageAsBlob(stream);
                        const imageBlob = await imageArrayBuffer(stream);
                        // const imageBlob = await streamImage(stream);

                        formData.append(key, imageBlob, {
                            filename: filename,
                            contentType: entity[key].contentType || 'image/jpeg',
                        });
                    } else if (stream instanceof http.IncomingMessage || stream instanceof Blob) {
                        console.log(`appending ${key} as stream with metadata`);
                        formData.append(key, stream, {
                            filename: filename,
                            contentType: entity[key].contentType || 'image/jpeg',
                        });
                    }
                } else if (entity[key] instanceof http.IncomingMessage || entity[key] instanceof Blob) {
                    console.log(`appending ${key} as file stream `)
                    formData.append(key, entity[key]);
                } else if (typeof entity[key] === 'object' && entity[key] !== null) {
                    console.log(`handle ${entity[key].length} object entries for ${key}`)
                    for (let nestedKey in entity[key]) {
                        formData.append(`${key}.${nestedKey}`, entity[key][nestedKey]);
                    }
                } else if (typeof entity[key] === 'boolean') {
                    formData.append(key, entity[key].toString());
                } else if (typeof entity[key] === 'string' || typeof entity[key] === 'number') {
                    formData.append(key, entity[key]);
                } else {
                    console.log("UNHANDLED DATA TYPE", entity[key]);
                }
            }

            let formHeaders = {};
            if (typeof formData.getHeaders === 'function') {
                formHeaders = formData.getHeaders();
            } else {
                const boundary = (formData as any)[Symbol.for('undici:formdata:boundary')];
                if (boundary) {
                    formHeaders = {
                        'Content-Type': `multipart/form-data boundary=${boundary}`
                    };
                }
            }

            Object.assign(headers, formHeaders)
        }

        return {formData, headers};
    }

}
