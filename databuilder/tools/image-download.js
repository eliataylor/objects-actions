const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');


function downloadPixelBay() {
    // use in browser console on https://pixabay.com/images/search/person/
    // Select all elements with the class 'link--WHWzm'
    const linkElements = document.querySelectorAll('.link--WHWzm');

    // Initialize an empty array to store the src attributes
    const imgSrcArray = [];

    // Loop through each element
    linkElements.forEach(linkElement => {
        // Find all img elements within the current element
        const imgElements = linkElement.getElementsByTagName('img');

        // Loop through each img element and add its src attribute to the array
        for (let imgElement of imgElements) {
            imgSrcArray.push(imgElement.src);
        }
    });

    // copied to imgSrcArray below
    console.log(imgSrcArray);
}

const imgSrcArray = [
    "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/01/03/19/54/fashion-3059143_640.jpg",
    "https://cdn.pixabay.com/photo/2019/11/26/17/48/girl-4655079_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/19/09/45/man-1838330_640.jpg",
    "https://cdn.pixabay.com/photo/2016/05/24/18/49/suitcase-1412996_640.jpg",
    "https://cdn.pixabay.com/photo/2018/01/15/09/17/woman-3083516_640.jpg",
    "https://cdn.pixabay.com/photo/2023/03/02/11/38/man-7825138_640.jpg",
    "https://cdn.pixabay.com/photo/2017/02/26/02/37/girl-2099359_640.jpg",
    "https://cdn.pixabay.com/photo/2018/02/21/08/40/woman-3169726_640.jpg",
    "https://cdn.pixabay.com/photo/2017/11/06/13/45/cap-2923682_640.jpg",
    "https://cdn.pixabay.com/photo/2017/04/01/21/06/portrait-2194457_640.jpg",
    "https://cdn.pixabay.com/photo/2016/01/08/16/04/woman-1128523_640.jpg",
    "https://cdn.pixabay.com/photo/2021/12/21/09/40/dogs-6884916_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/18/16/51/woman-1835781_640.jpg",
    "https://cdn.pixabay.com/photo/2023/03/17/16/14/silhouette-7858977_640.jpg",
    "https://cdn.pixabay.com/photo/2018/03/01/14/57/portrait-3190849_640.jpg",
    "https://cdn.pixabay.com/photo/2013/07/12/17/02/girl-151713_640.png",
    "https://cdn.pixabay.com/photo/2019/05/17/15/34/sad-4209944_640.jpg",
    "https://cdn.pixabay.com/photo/2020/05/01/08/29/portrait-5115894_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/23/17/25/woman-1853939_640.jpg",
    "https://cdn.pixabay.com/photo/2017/10/19/18/26/woman-2868727_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_640.png",
    "https://cdn.pixabay.com/photo/2015/07/20/12/57/ambassador-852766_640.jpg",
    "https://cdn.pixabay.com/photo/2017/05/18/08/25/girl-2322901_640.jpg",
    "https://cdn.pixabay.com/photo/2013/07/18/10/58/girl-163686_640.jpg",
    "https://cdn.pixabay.com/photo/2016/07/27/03/11/ice-cream-1544475_640.png",
    "https://cdn.pixabay.com/photo/2016/11/29/11/24/woman-1869158_640.jpg",
    "https://cdn.pixabay.com/photo/2016/08/01/20/15/girl-1562025_640.jpg",
    "https://cdn.pixabay.com/photo/2018/01/02/09/47/woman-3055841_640.jpg",
    "https://cdn.pixabay.com/photo/2022/11/18/18/34/knit-cap-7600730_640.jpg",
    "https://cdn.pixabay.com/photo/2018/02/24/20/40/fashion-3179178_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/29/12/52/face-1869641_640.jpg",
    "https://cdn.pixabay.com/photo/2018/02/16/14/38/portrait-3157821_640.jpg",
    "https://cdn.pixabay.com/photo/2024/02/13/07/05/ai-generated-8570323_640.jpg",
    "https://cdn.pixabay.com/photo/2015/11/26/00/14/woman-1063100_640.jpg",
    "https://cdn.pixabay.com/photo/2020/03/17/14/01/silhouette-4940445_640.jpg",
    "https://cdn.pixabay.com/photo/2013/07/12/14/07/student-147783_640.png",
    "https://cdn.pixabay.com/photo/2024/02/09/16/17/outdoors-8563340_640.png",
    "https://cdn.pixabay.com/photo/2019/11/22/09/35/woman-4644496_640.jpg",
    "https://cdn.pixabay.com/photo/2013/07/13/12/11/caveman-159359_640.png",
    "https://cdn.pixabay.com/photo/2019/05/02/08/24/woman-4172859_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/18/14/08/jetty-1834801_640.jpg",
    "https://cdn.pixabay.com/photo/2014/05/22/16/57/man-351281_640.jpg",
    "https://cdn.pixabay.com/photo/2016/02/23/02/55/juggler-1216853_640.jpg",
    "https://cdn.pixabay.com/photo/2023/06/07/04/23/road-8046167_640.jpg",
    "https://cdn.pixabay.com/photo/2019/07/12/08/04/silhouette-4332215_640.jpg",
    "https://cdn.pixabay.com/photo/2023/01/01/09/30/lonely-7689797_640.jpg",
    "https://cdn.pixabay.com/photo/2015/10/10/19/57/elderly-981400_640.jpg",
    "https://cdn.pixabay.com/photo/2020/09/18/05/58/lights-5580916_640.jpg",
    "https://cdn.pixabay.com/photo/2022/08/01/21/34/people-7359033_640.jpg",
    "https://cdn.pixabay.com/photo/2021/02/15/08/35/breakwater-6017041_640.jpg",
    "https://cdn.pixabay.com/photo/2017/03/21/15/08/child-2162410_640.jpg",
    "https://cdn.pixabay.com/photo/2018/10/29/21/46/human-3782189_640.jpg",
    "https://cdn.pixabay.com/photo/2017/03/27/14/59/man-2179243_640.jpg",
    "https://cdn.pixabay.com/photo/2019/11/07/17/54/woman-4609514_640.jpg",
    "https://cdn.pixabay.com/photo/2022/07/04/04/37/musician-7300353_640.jpg",
    "https://cdn.pixabay.com/photo/2022/02/15/14/21/eye-7015058_640.jpg",
    "https://cdn.pixabay.com/photo/2019/12/26/09/49/nature-4720090_640.jpg",
    "https://cdn.pixabay.com/photo/2020/01/10/11/39/girl-4755130_640.jpg",
    "https://cdn.pixabay.com/photo/2019/04/12/21/19/man-4123268_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/18/19/07/happy-1836445_640.jpg",
    "https://cdn.pixabay.com/photo/2017/07/26/16/32/woman-2542252_640.jpg",
    "https://cdn.pixabay.com/photo/2021/05/24/19/34/girl-6280358_640.jpg",
    "https://cdn.pixabay.com/photo/2023/04/04/05/17/vietnam-7898501_640.jpg",
    "https://cdn.pixabay.com/photo/2017/08/26/21/40/people-2684421_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/29/06/46/adult-1867889_640.jpg",
    "https://cdn.pixabay.com/photo/2015/09/06/00/46/yellow-926728_640.jpg",
    "https://cdn.pixabay.com/photo/2017/10/10/02/50/gentlemen-2835737_640.jpg",
    "https://cdn.pixabay.com/photo/2021/05/25/04/19/boy-6281260_640.jpg",
    "https://cdn.pixabay.com/photo/2018/05/04/12/21/man-3373868_640.jpg",
    "https://cdn.pixabay.com/photo/2015/07/31/15/01/man-869215_640.jpg",
    "https://cdn.pixabay.com/photo/2019/07/26/20/52/man-4365597_640.png",
    "https://cdn.pixabay.com/photo/2016/11/21/17/02/adventure-1846482_640.jpg",
    "https://cdn.pixabay.com/photo/2021/02/26/20/13/girl-6053037_640.jpg",
    "https://cdn.pixabay.com/photo/2020/01/01/14/59/person-4733756_640.jpg",
    "https://cdn.pixabay.com/photo/2022/06/24/11/38/street-7281553_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/29/20/22/girl-1871104_640.jpg",
    "https://cdn.pixabay.com/photo/2021/04/10/05/32/woman-6166085_640.jpg",
    "https://cdn.pixabay.com/photo/2015/11/06/11/43/businessman-1026415_640.jpg",
    "https://cdn.pixabay.com/photo/2017/04/05/01/15/ocean-2203720_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/18/15/03/man-1835195_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_640.jpg",
    "https://cdn.pixabay.com/photo/2021/01/25/11/29/woman-5948094_640.jpg",
    "https://cdn.pixabay.com/photo/2015/06/01/00/20/man-792821_640.jpg",
    "https://cdn.pixabay.com/photo/2017/12/31/15/56/portrait-3052641_640.jpg",
    "https://cdn.pixabay.com/photo/2017/02/26/02/37/girl-2099363_640.jpg",
    "https://cdn.pixabay.com/photo/2015/07/15/06/42/man-845709_640.jpg",
    "https://cdn.pixabay.com/photo/2020/02/05/11/04/woman-4820864_640.jpg",
    "https://cdn.pixabay.com/photo/2021/01/25/11/54/woman-5948133_640.jpg",
    "https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_640.jpg",
    "https://cdn.pixabay.com/photo/2020/07/03/19/33/portrait-5367362_640.jpg",
    "https://cdn.pixabay.com/photo/2015/06/22/08/39/child-817371_640.jpg",
    "https://cdn.pixabay.com/photo/2019/03/20/21/46/man-4069631_640.jpg",
    "https://cdn.pixabay.com/photo/2017/09/25/13/12/man-2785071_640.jpg",
    "https://cdn.pixabay.com/photo/2016/08/01/20/12/girl-1561979_640.jpg",
    "https://cdn.pixabay.com/photo/2024/01/01/13/55/snow-8481377_640.jpg",
    "https://cdn.pixabay.com/photo/2023/11/06/14/51/person-8369789_640.jpg",
    "https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824147_640.png",
    "https://cdn.pixabay.com/photo/2018/01/21/14/35/young-3096733_640.jpg",
    "https://cdn.pixabay.com/photo/2016/01/31/15/45/kaputze-1171625_640.jpg"
]

// Target directory where images will be saved
const targetDir = path.join(__dirname, 'profilepics');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}


// Function to download an image
const downloadImage = (url, targetPath) => {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get ${url}: ${response.statusCode}`));
            }

            const fileStream = fs.createWriteStream(targetPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close(resolve);
            });

            fileStream.on('error', (err) => {
                fs.unlink(targetPath, () => reject(err));
            });
        });

        request.on('error', (err) => {
            fs.unlink(targetPath, () => reject(err));
        });
    });
};

// Function to download all images if they don't exist
const downloadImages = async () => {
    for (const url of imgSrcArray) {
        const fileName = path.basename(url);
        const targetPath = path.join(targetDir, fileName);

        if (!fs.existsSync(targetPath)) {
            try {
                console.log(`Downloading ${url}...`);
                await downloadImage(url, targetPath);
                console.log(`Downloaded ${url} to ${targetPath}`);
            } catch (error) {
                console.error(`Failed to download ${url}: ${error.message}`);
            }
        } else {
            console.log(`${fileName} already exists, skipping.`);
        }
    }
};

// Start downloading images
downloadImages();

