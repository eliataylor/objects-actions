#!/usr/bin/env ts-node

import { FieldTypeDefinition, TypeFieldSchema } from "../../templates/reactjs/src/object-actions/types/types";
import { fakeFieldData} from "./builder-utils";


interface Structure {
    type: string;
    count: number;
}

interface ResponseData {
    success: boolean;
    data: any;
    started:number;
    ended:number;
}

export class WorldBuilder {
    private structure: Structure[];
    private responses: ResponseData[];

    constructor(structure: Structure[]) {
        this.structure = structure;
        this.responses = [];
    }

    private async postData(type: string, data:any): Promise<ResponseData> {
        const started = new Date().getTime()
        try {
            const response = await fetch(`//${process.env.REACT_APP_API_HOST}/forms/${type}/-1/add`, {
                body: data,
                headers: {
//                            'Authorization': 'Bearer YOUR_TOKEN_HERE',
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            return {success: true, data: result, started: started, ended: new Date().getTime()};
        } catch (error) {
            return {success: false, data: error.response ? error.response.data : error.message, started: started, ended: new Date().getTime()};
        }
    }

    public async buildWorld() {
        for (const item of this.structure) {
            for(let i=0; i < item.count; i++) {
                const fields:FieldTypeDefinition[] = Object.values(TypeFieldSchema[item.type])
                const entity : any = {}
                fields.forEach(field => {
                    entity[field.machine] = fakeFieldData(field.field_type)
                })
                const response = await this.postData(item.type, entity);
                if (typeof this.responses[item.type] === 'undefined') this.responses[item.type] = [];
                this.responses[item.type].push(response);
            }
        }
    }

    public getResponses(): ResponseData[] {
        return this.responses;
    }


}

// Usage example:
const structure: Structure[] = [
    {type: 'supplier', count: 3},
    {type: 'ingredient', count: 10},
];

const builder = new WorldBuilder(structure);
builder.buildWorld().then(() => {
    console.log(builder.getResponses());
});
