const spider = require('spider');
const TurndownService = require('turndown');
const getMidFromUrl = require('./getMidFromUrl');

const turndown = new TurndownService();

function getMdArticle(mid, url) {
    return new Promise((resolve, reject) => {
        spider.Spider(
            url,
            (err, data) => {
                if (!err) {
                    let content = data.content;
                    content = content.replace(/<img.+?data-src=(['"])(.+?)\1.+?>/g, (d, $1, $2) => {
                        if (~$2.indexOf('wx_fmt=')) {
                            $2 = $2.replace(/wx_fmt=(.+?)\b/, 'wx_fmt=webp');
                        } else {
                            if (~$2.indexOf('?')) {
                                $2 += '&wx_fmt=webp';
                            } else {
                                $2 += '?wx_fmt=webp';
                            }
                        }
                        return `<img src="${$2.replace('/0', '/640')}" />`;
                    });
                    // console.log(content);
                    data.content = turndown.turndown(content, {gfm: true});
                    data.mid = mid;
                    resolve(data);
                } else {
                    resolve();
                }
                // content = toMd(content, { gfm: true });
                // console.log(title, content);
            },
            {
                links: {
                    selector: '#js_content a',
                    handler: (dom, $) => {
                        let url = dom.attr('href');
                        return {title: dom.text(), mid: getMidFromUrl(url), url};
                    }
                },
                content: {
                    selector: '#js_content'
                },
                title: {
                    selector: 'title',
                    handler: (dom, $) => {
                        return dom.text();
                        // return dom;
                    }
                }
            }
        );
    });
}
module.exports = getMdArticle;
// getMdArticle(
// 'aaa',
// 'https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959830&idx=1&sn=ce1c5a58caed227d7dfdbc16d6e1cea4&chksm=bd2d07ca8a5a8edc45cc45c4787cc72cf4c8b96fb43d2840c7ccd44978036a7d39a03dd578b5&scene=21#wechat_redirect'
// ).then((data) => {
// console.log(data);
// });
