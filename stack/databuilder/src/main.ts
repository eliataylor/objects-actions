import * as dotenv from 'dotenv';
import {WorldBuilder} from "./WorldBuilder";
import {NAVITEMS, Users} from "./types";

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
        for (let i = 0; i < parseInt(args.count); i++) {
            const baseData = {} // TODO: allow passing configs from CLI
            await builder.registerUser(baseData);
        }
    }

    if (args.action === 'objects-add') {
        await builder.loginUser(process.env.REACT_APP_LOGIN_EMAIL!);  // needs auth to getContentCreators
        await builder.getContentCreators();

        for (const nav of NAVITEMS) {
            for (let i = 0; i < args.count; i++) {
                await builder.buildObject(nav);
            }
        }
    }

    if (args.action === 'object-add') {
        await builder.loginUser(process.env.REACT_APP_LOGIN_EMAIL!);  // needs auth to getContentCreators
        await builder.getContentCreators()
        const target_type = typeof args.type === 'string' ? args.type.toLowerCase() : 'all';

        let manual = NAVITEMS.find(nav => nav.type.toLowerCase() === target_type);
        if (!manual) {
            return console.error(`no such model ${manual}`)
        }
        for (let i = 0; i < args.count; i++) {
            await builder.buildObject(manual);
        }
    }

    if (args.action === 'delete-all') {
        await builder.loginUser(process.env.REACT_APP_LOGIN_EMAIL!);  // needs auth to getContentCreators
        const allCreators = await builder.getContentCreators();
        allCreators.forEach((async (user: Users) => {
            await builder.deleteTester(user);
        }))
    }
}

start()
