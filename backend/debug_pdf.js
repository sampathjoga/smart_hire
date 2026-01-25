const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf export:', typeof pdf);
console.log('Is pdf a function?', typeof pdf === 'function');
console.log('pdf export keys:', Object.keys(pdf));

if (typeof pdf !== 'function') {
    console.log('pdf.default?', pdf.default);
}
