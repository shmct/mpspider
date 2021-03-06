const fs = require('fs-extra');
const Queue = require('./lib/Queue');
const getMdArticle = require('./lib/getMdArticle');
const getRelateArticle = require('./lib/getRelateArticle');
const path = require('path');
const unique = new Set();

function self(items, jsonFilePath) {
    // const items = fs.readJSONSync('./.cache/all.json');
    return new Promise((resolve, reject) => {
        if (!Array.isArray(items)) {
            reject('items is not an Array');
        }
        _self(items, jsonFilePath);
        function _self(items, jsonFilePath) {
            items.forEach((item) => {
                item.links = getRelateArticle(item);
                unique.add(item.mid);
            });

            const relates = [];
            items.forEach(({links}) => {
                if (links && links.length) {
                    links.forEach((link) => {
                        if (!unique.has(link.mid)) {
                            relates.push(link);
                        }
                    });
                }
            });

            if (relates.length !== 0) {
                const queue = new Queue(getMdArticle, 2);
                relates.forEach(({url, mid, title}, i) => {
                    queue.add([mid, url]);
                });
                queue.run().then(
                    (data) => {
                        let newData = data.concat(items);
                        if (jsonFilePath) {
                            fs.writeJSONSync(jsonFilePath, newData);
                        }
                        //递归执行
                        _self(newData, jsonFilePath);
                    },
                    (e) => {
                        reject(e);
                    }
                );
            } else {
                resolve(items);
            }
        }
    });
}

module.exports = self;
