const fs = require('fs');

const proof = JSON.parse(fs.readFileSync('proof.json', 'utf8'));
const publicSignals = JSON.parse(fs.readFileSync('public.json', 'utf8'));

const a = [proof.pi_a[0], proof.pi_a[1]];
const b = [
    [proof.pi_b[0][1][0], proof.pi_b[0][1][1]],
    [proof.pi_b[0][0][0], proof.pi_b[0][0][1]]
];
const c = [proof.pi_c[0], proof.pi_c[1]];
const input = publicSignals;

console.log("\n=== COPY TO REMIX ===\n");
console.log("a:");
console.log(JSON.stringify(a));
console.log("\nb:");
console.log(JSON.stringify(b));
console.log("\nc:");
console.log(JSON.stringify(c));
console.log("\ninput:");
console.log(JSON.stringify(input));
console.log("\n=====================\n");
