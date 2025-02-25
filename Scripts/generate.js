import { readdir } from 'node:fs/promises';
import * as fs from 'fs';

const rootPath = fs.realpathSync('./');
const rootDirectory = '/Coasters';

let parks = [];
let coasters = [];

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
            park.credits.forEach((coaster) => {
                coasters.push(coaster);
            })
        });

        console.log(`Park count: ${parks.length}`);
        console.log(`Coaster count: ${coasters.length}`);

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

        // Most ridden manufacturers
        const uniqueListOfManufactuers = [...new Set(coasters.map(coaster => coaster.manufacturer))].filter((record) => record != '');
        const mostRiddenManufactuers = uniqueListOfManufactuers.map((manufacturer) => {
            return {
                manufacturer,
                count: coasters.filter(v => manufacturer === v.manufacturer).length,
            }
        }).sort((a,b) => b.count - a.count);

        // Most ridden models
        const uniqueListOfModels = [...new Set(coasters.map(coaster => coaster.model))].filter((record) => record != '');
        const mostRiddenModels = uniqueListOfModels.map((model) => {
            return {
                model,
                count: coasters.filter(v => model === v.model).length,
            }
        }).sort((a,b) => b.count - a.count);

        // Save to data.json

        const dataStr = JSON.stringify({
            coasterCount: coasters.length,
            mostRiddenManufactuers,
            mostRiddenModels,
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