function compareJSON(arrayOfJsonObjects, arrayOfkeysToIgnore) {
    let differences = [];

    function shouldIgnore(key, ignoreKeys) {
        return ignoreKeys.includes(key);
    }

    function compare(obj1, obj2, path = '', ignoreKeys = []) {
        for (let key in obj1) {
            if (obj1.hasOwnProperty(key) && !shouldIgnore(key, ignoreKeys)) {
                const fullPath = path ? `${path}.${key}` : key;

                if (!obj2.hasOwnProperty(key)) {
                    differences.push({path: fullPath, value1: obj1[key], value2: undefined});
                } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
                    compare(obj1[key], obj2[key], fullPath, ignoreKeys);
                } else if (obj1[key] !== obj2[key]) {
                    differences.push({path: fullPath, value1: obj1[key], value2: obj2[key]});
                }
            }
        }

        for (let key in obj2) {
            if (obj2.hasOwnProperty(key) && !shouldIgnore(key, ignoreKeys) && !obj1.hasOwnProperty(key)) {
                const fullPath = path ? `${path}.${key}` : key;
                differences.push({path: fullPath, value1: undefined, value2: obj2[key]});
            }
        }
    }

    for (let i = 0; i < arrayOfJsonObjects.length - 1; i++) {
        for (let j = i + 1; j < arrayOfJsonObjects.length; j++) {
            compare(arrayOfJsonObjects[i], arrayOfJsonObjects[j], '', arrayOfkeysToIgnore);
        }
    }

    return differences;
}

function main_mobilepackets(parsedResults, arrayOfkeysToIgnore) {

    // Group jsonBodies by 8-second windows
    let groups = [];
    let currentGroup = [];
    let startTime = new Date(parsedResults[0].created_at).getTime();

    for (let i = 0; i < parsedResults.length; i++) {
        const row = parsedResults[i];
        const json_body = typeof row.req_body === 'string' ? JSON.parse(row.req_body) : row.req_body;
        if (json_body.event !== 'site_contact_attempt') continue;

        const nextTime = new Date(row.created_at).getTime()
        const timeDifference = (nextTime - startTime) / 1000;

        if (timeDifference <= 8) {
            currentGroup.push({req_body: json_body, created_at: row.created_at});
        } else {
            if (currentGroup.length > 1) {
                groups.push(currentGroup);
            }
            currentGroup = [{req_body: json_body, created_at: row.created_at}];
            startTime = new Date(row.created_at).getTime();
        }
    }

    if (currentGroup.length > 1) {
        groups.push(currentGroup);
    }

    // Compare JSON bodies in each group
    groups.forEach(group => {
        const jsonBodies = group.map(item => item.req_body);
        let uuids = {};
        jsonBodies.forEach(j => {
            if (typeof uuids[j.uuid] !== 'undefined') {
                console.warn("DUPLICATED UUID!!!!!!!", j.uuid);
            }
            uuids[j.uuid] = true
        })


        const differences = compareJSON(jsonBodies, arrayOfkeysToIgnore);
        if (differences.length === 0) {
            console.log(`No difference in ${group.length} packets created between ${group[0].created_at} and ${group[group.length - 1].created_at}:`, jsonBodies);
        } else {
            console.log(`Differences for group of ${group.length} packets created between ${group[0].created_at} and ${group[group.length - 1].created_at}:`, differences);
        }

    });

    console.log(`TOTAL OF ${groups.length} GROUPS HAVE differences:`);
}

/* // USAGE:
const mobilePacketIgnores = ['event_time', 'phone_time', 'uuid', 'location', 'time'];
main_mobilepackets([], mobilePacketIgnores);
*/
