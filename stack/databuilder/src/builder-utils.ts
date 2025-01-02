import {join} from 'path';
import {en, Faker} from '@faker-js/faker';
import axios from 'axios';
import fs from 'fs';
import {get} from 'https'; // Use 'http' if needed
import {Readable} from 'stream'; // Ensure compatibility with Node.js 18+


const faker = new Faker({
    locale: [en],
});


export async function getImageStream(imageUrl: string): Promise<Blob> {
    const response = await axios.get(imageUrl, {
        responseType: 'stream',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
    });
    if (response.status !== 200) {
        throw new Error(`Failed from ${imageUrl}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // Create a Blob from the ArrayBuffer
    return new Blob([arrayBuffer], {type: response.headers.get('content-type') || 'image/jpeg'});

}

export async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
    // Fetch the image using the native fetch
    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;

    // Get the response as an ArrayBuffer
    // const arrayBuffer = await response.arrayBuffer();

    // Create a Blob from the ArrayBuffer
    // return new Blob([arrayBuffer], {type: response.headers.get('content-type') || 'image/jpeg'});
}

export async function getImageAsBlob(imageUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        get(imageUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch image: ${response.statusCode}`));
                return;
            }

            return resolve(response);

            // Ensure the response is a readable stream
            const readableStream = Readable.from(response);

            // Collect image data as a buffer
            const chunks: Buffer[] = [];
            readableStream.on('data', (chunk) => chunks.push(chunk));
            readableStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(
                    new Blob([buffer], {type: response.headers['content-type'] || 'image/jpeg'})
                );
            });

            readableStream.on('error', (err) => reject(err));
        }).on('error', reject);
    });
}

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

interface ImageMetaData {
    file: string;
    license: string;
    owner: string;
    width: number;
    height: number;
    filter: string;
    tags: string;
    tagMode: string;
    rawFileUrl: string;
}

// needed because flickr now rate limiting)
async function fetchImageMetaData(category: string): Promise<ImageMetaData> {

    const [major] = process.versions.node.split('.').map(Number);
    const url = `https://loremflickr.com/json/g/320/240/${category.toLowerCase()}/all`

    try {
        if (major >= 18) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } else {
            const response = await axios.get(url);
            return response.data;
        }
    } catch (error) {
        const fallbackUrl = faker.image.urlLoremFlickr({category});
        console.warn(`Metadata fetch failed. Falling back to faker URL: ${fallbackUrl}`, error);
        return {
            file: fallbackUrl,
            license: "unknown",
            owner: "unknown",
            width: 320,
            height: 240,
            filter: "none",
            tags: category,
            tagMode: "all",
            rawFileUrl: fallbackUrl,
        };
    }
}

export async function fakeFieldData(field_type: string, field_name: string, options: any, model_type: string): Promise<any> {
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
            let txt;
            try { // handle "The locale data for 'internet.emoji' are missing in this locale"
                if (field_name === 'bio') {
                    txt = faker.person.bio()
                } else {
                    txt = faker.word.words(5)
                }
                return txt
            } catch (error) {
                return faker.word.words(5)
            }
        case 'integer':
            return faker.number.int({min: 1, max: 2147483647});
        case 'price':
            return faker.commerce.price();
        case 'decimal':
            return faker.number.float({min: 0, max: 2147483647});
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
            let email;
            try { // handle "The locale data for 'internet.emoji' are missing in this locale"
                email = faker.internet.email();
            } catch (error) {
                email = `info-${new Date().getTime()}@oaexample.com`
            }
            return email
        case 'phone':
            // @ts-ignore
            return faker.phone.number({style: 'international'})
        case 'address':
            const state = faker.location.state({abbreviated: true})
            return `${faker.location.streetAddress()} ${faker.location.city()} ${state} ${faker.location.zipCode({state})}`;
        case 'url':
            let iurl;
            try { // handle "The locale data for 'internet.emoji' are missing in this locale"
                iurl = faker.internet.url();
            } catch (error) {
                iurl = `https://oaexample.com/test/${new Date().getTime()}`
            }
            return iurl
        case 'uuid':
            return faker.string.uuid();
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
            const imageMeta = await fetchImageMetaData(model_type);
            return imageMeta.rawFileUrl;
        case 'video':
            const videoOpts = [
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
            ]
            const randomIndex = Math.floor(Math.random() * videoOpts.length);
            return videoOpts[randomIndex];
        case 'media':
            // return faker.image.urlPicsumPhotos()
            return faker.image.urlLoremFlickr({category: model_type})
        case 'flat_list':
            return Array.from({length: 5}, () => faker.lorem.word()); // Example of a flat list
        case 'bounding_box':
            return `{"lat":${faker.location.latitude()}, "lng":${faker.location.longitude()}, "lat2":${faker.location.latitude()}, "lng2":${faker.location.longitude()}}`;
        // return `[${faker.location.latitude()},${faker.location.longitude()},${faker.location.latitude()},${faker.location.longitude()}]`;
        case 'json':
            return faker.helpers.fake('{{name.firstName}} {{name.lastName}}, {{address.city}}');
        case 'enum':
            // @ts-ignore
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
