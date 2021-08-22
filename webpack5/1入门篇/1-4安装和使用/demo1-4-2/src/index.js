/**
 * index.js  webpack入口起点文件
 */

import data from './data.json';
// const data = require('./data.json')

 function add (x, y) {
  return x + y;
}

console.log(data);
console.log(add(1, 2));