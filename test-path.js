const { testJSONPath } = require("./lib/json-utils.js");
const json = `{"company": "Anthropic", "teams": [{"name": "Research", "lead": "Dario", "members": ["Alice", "Bob"], "budget": 5000000}]}`;

let res = testJSONPath(json, "$.company");
console.log(res);
res = testJSONPath(json, "$.teams[0].name");
console.log(res);
