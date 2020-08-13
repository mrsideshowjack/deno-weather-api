import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";
import {
  fromUnixTime,
  format,
} from "https://deno.land/x/date_fns@v2.15.0/index.js";
import AsciiTable from "https://deno.land/x/ascii_table/mod.ts";
import { config } from 'https://deno.land/x/dotenv/mod.ts';

const args = parse(Deno.args);

// Handle no city arg
if (args.city === undefined) {
    console.error("No city supplied ❌");
    Deno.exit();
}

// get api key from .env 
const apiKey = config()['API_KEY'];

// fetch weather data from API
const res = await fetch(
  `https://api.openweathermap.org/data/2.5/forecast?q=${args.city}&units=metric&appid=${apiKey}`,
);
const data = await res.json();
console.log(data);

// handle api errors
if (data.cod !== "200") {
    console.error("API call failed ❌");
    console.error(data.message);
    Deno.exit();
}

// define typescript type for forecast item
interface forecastItem {
  dt: string;
  main: { temp: number };
  weather: { description: string }[];
}

// map each forecast into a forecast item
const forecast = data.list.slice(0, 10).map((item: forecastItem) => [
  format(fromUnixTime(item.dt), "do LLL, k:mm", {}),
  `${item.main.temp.toFixed(1)}C`,
  item.weather[0].description,
]);

// create ascii table from json data
const table = AsciiTable.fromJSON({
  title: `${data.city.name} Forecast`,
  heading: ["Time ⏰", "Temp 🌡", "Weather 🌤"],
  rows: forecast,
});

// output the table
console.log(table.toString());