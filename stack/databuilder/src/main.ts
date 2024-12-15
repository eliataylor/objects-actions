#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import {WorldBuilder} from "./WorldBuilder";
import {NAVITEMS} from "./types";

dotenv.config();

const args: { [key: string]: string | number } = {};

for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        args[key] = value || 'true';
    }
}

if (!args.count) args.count = 1
console.log('CLI Arguments:', args);

async function start() {

    const builder = new WorldBuilder();

    if (args.action === 'users-add') {
        for (let i = 0; i < 10; i++) {
            const baseData = {} // TODO: allow passing configs from CLI
            await builder.registerUser(baseData);
        }
    }

    if (args.action === 'objects-add') {
        // const creators = await builder.getContentCreators();

        // TODO: generally types must be inserted in an order!

        for (const nav of NAVITEMS) {
            for (let i = 0; i < args.count; i++) {
                await builder.buildObject({...nav, count: 5});
            }
        }

    }

}

start()



