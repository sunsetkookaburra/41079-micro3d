const broken = JSON.parse(Deno.readTextFileSync(new URL("./alumnigarden.json", import.meta.url)));

for (const orientation of broken["orientation"]) {
  orientation[2] = 2 * Math.atan(Math.sqrt(Math.tan(orientation[2] / 2))) - Math.PI / 2;
}

Deno.writeTextFileSync(new URL("./alumnigardenrectify.json", import.meta.url), JSON.stringify(broken));

broken["orientation"];

let min = Infinity;
let max = -Infinity;

for (let i = 1; i < broken["orientation"].length; ++i) {
  if (broken["orientation"][i][2] < min) min = broken["orientation"][i][2];
  if (broken["orientation"][i][2] > max) max = broken["orientation"][i][2];
}

console.log(min, max);
