import * as dotenv from 'dotenv';
import {WorldBuilder} from "./WorldBuilder";
import {NavItem, NAVITEMS} from "./types";

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
}

start()

        /*
        WARN: for now, types should be inserted in order by field dependency
        let manual = NAVITEMS.find(nav => nav.type === 'Attendees') as NavItem;
        await builder.buildObject(manual);
        return manual;
        */
