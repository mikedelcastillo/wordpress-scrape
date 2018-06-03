require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const urljoin = require('url-join');
const path = require('path');

const {TARGET_ID, TARGET_DOMAIN} = process.env;

if(!fs.existsSync(TARGET_ID)) fs.mkdirSync(TARGET_ID);

const targetUrl = urljoin(TARGET_DOMAIN, '/wp-json/wp/v2/media');

let scrapeData = [];
let page = 1;

function loop(){
  let url = targetUrl + `?page=${page}&per_page=100`;
  console.log(`Scraping: ${url}`);
  axios.get(url)
  .then(({data}) => {
    scrapeData = scrapeData.concat(data);
    console.log(page, scrapeData.length);
    page++;
    loop();
  })
  .catch(e => {
    fs.writeFileSync(
      path.join(TARGET_ID, 'media.html'),
      scrapeData.map(item => {
        console.log(item);
        let source = item.source_url;
        if(item.media_type == "file"){
          return `<a href="${source}">${item.title.rendered}</a>`;
        } else{
          let thumbUrl = item.media_details.sizes.thumbnail.source_url;
          let id = item.id;
          return `<a href="${source}"><img src="${thumbUrl}"/></a>`;
        }
      }).join("")
    );
  })
}

loop();
