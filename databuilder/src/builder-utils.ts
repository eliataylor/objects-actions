import {faker} from '@faker-js/faker';

export function fakeFieldData(field_type: string): any {
  switch (field_type) {
    case 'user account':
      return 1; // TODO
    case 'user profile':
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
      return faker.datatype.float({ min: 0, max: 10000, precision: 0.01 });
    case 'date':
      return faker.date.past().toISOString().split('T')[0];
    case 'date time':
      return faker.date.past().toISOString();
    case 'coordinates':
      return `${faker.address.latitude()}, ${faker.address.longitude()}`;
    case 'email':
      return faker.internet.email();
    case 'phone':
      return faker.phone.number();
    case 'address':
      return faker.address.streetAddress();
    case 'url':
      return faker.internet.url();
    case 'uuid':
      return faker.datatype.uuid();
    case 'slug':
      return faker.lorem.slug();
    case 'id (auto increment)':
      return faker.datatype.number({ min: 1, max: 10000 }); // Simulating auto increment ID
    case 'boolean':
      return faker.datatype.boolean();
    case 'image':
      return faker.image.imageUrl();
    case 'video':
      return faker.internet.url(); // Placeholder, could be a specific video URL generator
    case 'media':
      return faker.internet.url(); // Placeholder, could be more specific
    case 'flat list':
      return Array.from({ length: 5 }, () => faker.lorem.word()); // Example of a flat list
    case 'json':
      return faker.helpers.fake('{{name.firstName}} {{name.lastName}}, {{address.city}}');
    case 'enum':
      return faker.helpers.arrayElement(['option1', 'option2', 'option3']);
    case 'vocabulary reference':
    case 'type reference':
       // TODO
      return faker.lorem.word();
    default:
      return faker.lorem.word(); // Default to a random word for unknown types
  }
}
