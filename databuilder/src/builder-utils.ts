import {faker} from '@faker-js/faker';
import {join} from 'path';

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

export function fakeFieldData(field_type: string): any {
    switch (field_type) {
        case 'user_account':
            return 1; // TODO
        case 'user_profile':
            return 1; // TODO
        case 'text':
            return faker.lorem.text();
        case 'textarea':
            return faker.lorem.paragraph();
        case 'integer':
            return faker.datatype.number();
        case 'price':
            return faker.commerce.price();
        case 'decimal':
            return faker.datatype.float({min: 0, max: 10000, precision: 0.01});
        case 'date':
            return faker.date.past().toISOString().split('T')[0];
        case 'date_time':
            return faker.date.past().toISOString();
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
            return faker.datatype.number({min: 1, max: 10000}); // Simulating auto increment ID
        case 'boolean':
            return faker.datatype.boolean();
        case 'image':
            const filePath = getRandomFile('./public/profilepics')
            const fileStream = fs.createReadStream(filePath);
            return fileStream;
        case 'video':
            return faker.internet.url(); // Placeholder, could be a specific video URL generator
        case 'media':
            return faker.internet.url(); // Placeholder, could be more specific
        case 'flat_list':
            return Array.from({length: 5}, () => faker.lorem.word()); // Example of a flat list
        case 'json':
            return faker.helpers.fake('{{name.firstName}} {{name.lastName}}, {{address.city}}');
        case 'enum':
            return faker.helpers.arrayElement(['option1', 'option2', 'option3']);
        case 'vocabulary_reference':
        case 'type_reference':
            // TODO
            return faker.lorem.word();
        default:
            return faker.lorem.word(); // Default to a random word for unknown types
    }
}
