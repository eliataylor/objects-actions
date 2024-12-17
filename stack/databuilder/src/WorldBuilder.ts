import axios from 'axios';
import {FieldTypeDefinition, NavItem, NAVITEMS, TypeFieldSchema, Users} from "./types";
import ApiClient, {HttpResponse} from "./ApiClient";
import {fakeFieldData} from "./builder-utils";
import {faker} from '@faker-js/faker/locale/en_US';
import fs from "fs";
import path from "path";

const FormData = require('form-data');

interface Creators extends Users {
    cookie?: string[];
    token?: string[];
}

export interface WorldCount extends NavItem {
    type: string;
    count: number;
    base?: any;
}

type WorldData = { [key: string]: HttpResponse<any>[] }

export class WorldBuilder {
    private apiClient: ApiClient;
    private allCreators: Creators[];
    private fixturePath: string;

    constructor() {
        this.apiClient = new ApiClient();
        this.allCreators = []
        this.fixturePath = path.join(__dirname, '..', '..', 'cypress/cypress/fixtures');
    }

    saveFixture(name: string, data: any) {
        fs.writeFileSync(`${this.fixturePath}/${name}.json`, JSON.stringify(data));
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
        this.saveFixture(`user-add-${registered.data.id}`, registered)
        const profile = await this.updateUserProfile(registered.data.data.user);
        return profile;
    }

    public async updateUserProfile(user: any) {
        const fields = TypeFieldSchema["Users"]
        const baseData: any = {id: user.id};
        // @ts-ignore
        user = await this.populateEntity(user, NAVITEMS.find(nav => nav.type === "Users"))
        const apiUrl = `${process.env.REACT_APP_API_HOST}/api/users/${user.id}`
        const profile = await this.apiClient.post(apiUrl, baseData);
        this.saveFixture(`user-edit-${profile.data.id}`, profile)
        return profile.data;
    }

    public async buildObject(item: any) {

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

        const creator = await this.loadAuthor('superuser')

        let entity: any = {author: creator.id};
        const headers: any = {
            'accept': 'application/json'
        }
        entity = await this.populateEntity(entity, hasUrl)

        let formData = null;
        if (typeof entity.hasImage !== 'undefined') {
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
        if (!response.data?.id) {
            console.log(`Error ${item.type} --- ${response.error}`)
        } else {
            console.log(`Created ${item.type} --- ${JSON.stringify(response.data)}`)
            this.saveFixture(`object-add-${hasUrl.type}-${response.data.id}.json`, response.data);
        }
        return response;
    }

    private async populateEntity(entity: any, hasUrl: NavItem) {
        const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[hasUrl.type])
        for (const field of fields) {
            if (field.field_type === 'id_auto_increment' || field.field_type === 'slug') {
                // console.log(`let server handle ${field.field_type}`)
            } else if (field.field_type === 'user_profile' || field.field_type === 'user_account' || field.field_type == 'type_reference' || field.field_type == 'vocabulary_reference') {
                let relType = field.relationship?.toLowerCase()
                const relResponse = await this.apiClient.get(`${process.env.REACT_APP_API_HOST}/api/${relType}/`);
                // @ts-ignore
                if (relResponse.data && Array.isArray(relResponse.data.results) && relResponse.data.results.length > 0) {
                    // @ts-ignore
                    const randomIndex = Math.floor(Math.random() * relResponse.data.results.length);
                    // @ts-ignore
                    entity[field.machine] = relResponse.data.results[randomIndex].id || relResponse.data.results[randomIndex].slug

                    if (field.cardinality as number > 1) {
                        entity[field.machine] = [entity[field.machine]]
                    }
                } else {
                    console.warn(`relationship ${relType} has no data yet`)
                }

            } else if (field.field_type === 'image') {
                const imageUrl = faker.image.urlLoremFlickr({category: hasUrl.plural.toLowerCase()})
                console.log(`Going to load ${imageUrl}`)
                const imageResponse = await axios.get(imageUrl, {responseType: 'stream'});
                if (imageResponse.status !== 200) {
                    throw new Error(`Failed to fetch image from ${imageUrl}`);
                } else {
                    entity.hasImage = true;
                    entity[field.machine] = imageResponse.data;
                }
            } else {
                entity[field.machine] = fakeFieldData(field.field_type, field.machine, field.options, hasUrl.plural)
                if (['image', 'video', 'media'].indexOf(field.field_type) > -1) {
                    entity.hasImage = true;
                }
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

    public async loadAuthor(role: string) {
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

    public async loadAuthorByRole(role: string) {
        const contributors = await this.getContentCreators();
        // @ts-ignore
        let authors = contributors.filter(user => user.groups?.indexOf(role) > -1);

        if (!authors.length) {
            console.warn(`FALLING BACK ON SUPERUSER instead of ${role}.`); // TODO: paginate of meta
            const author = await this.loginUser('superuser')
            return author;
        }

        let randomIndex = Math.floor(Math.random() * authors.length);
        const author = authors[randomIndex]
        console.log(`REUSING CREATOR ${author.username}: `);
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
