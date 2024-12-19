// import {faker} from '@faker-js/faker';
import {faker} from '@faker-js/faker/locale/en_US';
import {join, resolve} from 'path';

const fs = require('fs');

function getRandomFile(directoryPath: string): string {
    const files: [] = fs.readdirSync(directoryPath);

    // Filter out any non-file entries
    const fileList = files.filter(file => {
        const filePath = join(directoryPath, file);
        return fs.statSync(filePath).isFile();
    });

    if (fileList.length === 0) {
        console.warn('No files found in the directory.');
        return faker.internet.url(); // Placeholder, could be a specific video URL generator
    }

    const randomIndex = Math.floor(Math.random() * fileList.length);
    const randomFile = fileList[randomIndex];
    return join(directoryPath, randomFile);
}

export function fakeFieldData(field_type: string, field_name: string, options: any, model_type: string): any {
    switch (field_type) {
        case 'user_account':
            return 1; // TODO
        case 'user_profile':
            return 1; // TODO
        case 'text':
            if (field_name === 'name') {
                // democrasee

                if (model_type == 'Cities') {
                    return faker.location.city()
                }
                if (model_type == 'States') {
                    return faker.location.state()
                }
                if (model_type == 'Topics') {
                    return faker.company.catchPhrase()
                }
                if (model_type == "ResourceTypes") {
                    return faker.commerce.department()
                }

                //djmote
                if (model_type == 'Venues') {
                    return `${faker.location.buildingNumber()} ${faker.location.street()}`
                }
                if (model_type == 'Events') {
                    return faker.commerce.productAdjective()
                }
                if (model_type == 'Songs') {
                    return faker.music.songName()
                }
                if (model_type == 'Playlists') {
                    return `${faker.commerce.department()} ${faker.music.genre()}`
                }
                return faker.person.fullName()
            }
            if (field_name === 'title') {
                if (model_type == 'ActionPlan') {
                    return faker.company.buzzPhrase()
                }

            }
            if (field_name === 'description') {
                return faker.commerce.productDescription()
            }
            if (field_name === 'artist') {
                return faker.person.fullName()
            }
            return faker.lorem.sentence({min: 1, max: 6});
        case 'textarea':
            if (field_name === 'bio') {
                return faker.person.bio()
            }
            return faker.lorem.paragraph();
        case 'integer':
            return faker.number.int({min: 1, max: 2147483647});
        case 'price':
            return faker.commerce.price();
        case 'decimal':
            return faker.number.float({min: 0, max: 2147483647, precision: 0.01});
        case 'date':
        case 'date_time':
            const start_date = faker.date.recent({days: 5});
            const max_date = faker.date.soon({days: 20, refDate: start_date})
            const end_date = faker.date.between({from: start_date, to: max_date});
            if (field_type == 'date') {
                return end_date.toISOString().split('T')[0];
            }
            return end_date.toISOString()
        case 'coordinates':
            return `{"lat":${faker.location.latitude()}, "lng":${faker.location.longitude()}}`;
        case 'email':
            return faker.internet.email();
        case 'phone':
            // @ts-ignore
            return faker.phone.number({style: 'international'})
        case 'address':
            const state = faker.location.state({abbreviated: true})
            return `${faker.location.streetAddress()} ${faker.location.city()} ${state} ${faker.location.zipCode({state})}`;
        case 'url':
            return faker.internet.url();
        case 'uuid':
            return faker.datatype.uuid();
        case 'slug':
            return faker.lorem.slug();
        case 'id_auto_increment':
            return faker.number.float({min: 1, max: 100000}); // Simulating auto increment ID
        case 'boolean':
            return faker.datatype.boolean();
        case 'image':
            // const filePath = getRandomFile('./public/profilepics')
            // const fileStream = fs.createReadStream(resolve(filePath));
            // return fileStream;
            return faker.image.urlLoremFlickr({category: model_type})
        case 'video':
            const videoOpts = [
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
            ]
            const randomIndex = Math.floor(Math.random() * videoOpts.length);
            return videoOpts[randomIndex];
        case 'media':
            return faker.image.urlLoremFlickr({category: model_type})
        case 'flat_list':
            return Array.from({length: 5}, () => faker.lorem.word()); // Example of a flat list
        case 'bounding_box':
            return `{"lat":${faker.location.latitude()}, "lng":${faker.location.longitude()}, "lat2":${faker.location.latitude()}, "lng2":${faker.location.longitude()}}`;
        // return `[${faker.location.latitude()},${faker.location.longitude()},${faker.location.latitude()},${faker.location.longitude()}]`;
        case 'json':
            return faker.helpers.fake('{{name.firstName}} {{name.lastName}}, {{address.city}}');
        case 'enum':
            const opt: any = faker.helpers.arrayElement(options);
            return opt.id
        case 'vocabulary_reference':
        case 'type_reference':
            console.warn('This should be handled in WorldBuilder')
            return faker.number.int({min: 1, max: 2147483647});
        default:
            return faker.lorem.word(); // Default to a random word for unknown types
    }
}
