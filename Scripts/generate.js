import { readdir } from 'node:fs/promises';
import * as fs from 'fs';

const rootPath = fs.realpathSync('./');
const rootDirectory = '/Coasters';

let parks = [];
let coaster_count = 0;

(async () => {
    try {
        const files = (await readdir(`${rootPath}${rootDirectory}`, { recursive: true })).filter((file) => file.includes('.json'));
        
        console.log(`Found ${files.length} json files`);
        
        files.forEach((path) => {
            const data = fs.readFileSync(`${rootPath}${rootDirectory}/${path}`, 'utf8');
            parks.push({
                ...JSON.parse(data),
                path,
            });
        });

        parks.forEach((park) => {
            coaster_count += park.credits.length;
        });

        console.log(`Park count: ${parks.length}`);
        console.log(`Coaster count: ${coaster_count}`);

        const countries = [...new Set(parks.map(park => park.Country))]
            .map((country) => {
                const parksInCountry = parks.filter((park) => {
                    return park.country === country
                });

                let coaster_count_in_country = 0;
                parksInCountry.forEach((park) => {
                    coaster_count_in_country += park.credits.length;
                })

                return({
                    country: country,
                    parks: parksInCountry,
                    coasterCount: coaster_count_in_country,
                })
            });

        const dataStr = JSON.stringify({
            coasterCount: coaster_count,
            details: countries,
        });

        fs.writeFile(`${rootPath}/data.json`, dataStr, (error) => {
            if (error) {
              console.error(error);
              throw error;
            }
            console.log("data.json written correctly");
          });
      } catch (err) {
        console.error(err);
      } 
})().catch(e => {
    console.log('Failed generation')
});