const qs = require('qs');
const querystring = require('querystring');

const urlString = "vpc_OrderInfo=Goi+Tri+Lieu+Khi+Tam+5K+Test";

console.log("querystring.parse:", JSON.stringify(querystring.parse(urlString)));
console.log("qs.parse (default):", JSON.stringify(qs.parse(urlString)));
console.log("qs.parse (allowDots):", JSON.stringify(qs.parse(urlString, { allowDots: true })));
