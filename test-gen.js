const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'testdata');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// 1. empty.json
fs.writeFileSync(path.join(outDir, 'empty.json'), '');

// 2. large.json (approx 10,000 lines)
const largeArray = Array.from({ length: 1500 }, (_, i) => ({
    id: i,
    guid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16);
    }),
    isActive: Math.random() > 0.5,
    balance: '$' + (Math.random() * 10000).toFixed(2),
    age: Math.floor(Math.random() * 60) + 18,
    name: { first: 'John' + i, last: 'Doe' + i },
    company: 'COMPANY_' + i,
    email: 'john.doe' + i + '@company.com'
}));
fs.writeFileSync(path.join(outDir, 'large.json'), JSON.stringify(largeArray, null, 2));

// 3. unicode.json
const unicodeObj = {
    "hello": "world",
    "greeting_jp": "こんにちは世界 ✨",
    "greeting_ar": "مرحبا بالعالم",
    "greeting_ru": "Привет, мир",
    "emojis": "🚀🔥💡",
    "complex_key_äöü": "values with special chars 漢字"
};
fs.writeFileSync(path.join(outDir, 'unicode.json'), JSON.stringify(unicodeObj, null, 2));

// 4. deep.json (highly nested)
let deep = { level: 100, val: "bottom" };
for (let i = 99; i > 0; i--) {
    deep = { ["level" + i]: deep, metadata: { index: i } };
}
fs.writeFileSync(path.join(outDir, 'deep.json'), JSON.stringify(deep, null, 2));

console.log('Test data generated successfully in public/testdata/');
