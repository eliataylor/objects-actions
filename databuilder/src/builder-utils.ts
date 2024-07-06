import {faker} from '@faker-js/faker';
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

export function fakeFieldData(field_type: string, field_name: string, options:any): any {
    switch (field_type) {
        case 'user_account':
            return 1; // TODO
        case 'user_profile':
            return 1; // TODO
        case 'text':
            if (field_name === 'name') {
                return faker.person.fullName()
            }
            if (field_name === 'artist') {
                return faker.person.middleName()
            }
            return faker.lorem.sentence({min:1, max:6});
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
            const start_date = faker.date.recent({days:5});
            const max_date = faker.date.soon({days:20, refDate: start_date})
            const end_date = faker.date.between({from:start_date, to: max_date});
            if (field_type == 'date') {
                return end_date.toISOString().split('T')[0];
            }
            return end_date.toISOString()
        case 'coordinates':
            return `${faker.location.latitude()}, ${faker.location.longitude()}`;
        case 'email':
            return faker.internet.email();
        case 'phone':
            return faker.phone.number();
        case 'address':
            return faker.location.streetAddress();
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
            const filePath = getRandomFile('./public/profilepics')
            const fileStream = fs.createReadStream(resolve(filePath));
            return fileStream;
        case 'video':
            return faker.internet.url(); // Placeholder, could be a specific video URL generator
        case 'media':
            return faker.internet.url(); // Placeholder, could be more specific
        case 'flat_list':
            return Array.from({length: 5}, () => faker.lorem.word()); // Example of a flat list
        case 'bounding_box':
            return `[${faker.location.latitude()},${faker.location.longitude()},${faker.location.latitude()},${faker.location.longitude()}]`;
        case 'json':
            return faker.helpers.fake('{{name.firstName}} {{name.lastName}}, {{address.city}}');
        case 'enum':
            const opt:any = faker.helpers.arrayElement(options);
            return opt.id
        case 'vocabulary_reference':
        case 'type_reference':
            console.warn('This should be handled in WorldBuilder')
            return faker.number.int({min: 1, max: 2147483647});
        default:
            return faker.lorem.word(); // Default to a random word for unknown types
    }
}