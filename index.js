const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const yts = require('yt-search');
const cheerio = require("cheerio");
const FormData = require("form-data");
const moment = require('moment');
const axios = require('axios');
require('moment/locale/es');
const qs = require("qs");
//const https = require('https');
const express = require("express")
//const NodeID3 = require('node-id3')
const https = require('https')
async function getTinyURL(longURL) {
    try {
        let response = await axios.get(`https://tinyurl.com/api-create.php?url=${longURL}`);
        return response.data;
    } catch (error) {
        return longURL;
    }
}

async function UploadEE(fileUrl) {
  function fakeUserAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }

  try {
    const baseUrl = "https://www.upload.ee";
    const response = await fetch(`${baseUrl}/ubr_link_upload.php?rnd_id=${Date.now()}`);
    const uploadId = ((await response.text()).match(/startUpload\("(.+?)"/) || [])[1];
    const fileResponse = await fetch(fileUrl, { headers: { "User-Agent": fakeUserAgent() } });
    const fileBuffer = await fileResponse.buffer();
    const formData = new FormData();
    formData.append("upfile_0", fileBuffer, { filename: "starlights" });
    formData.append("link", "");
    formData.append("email", "");
    formData.append("category", "cat_file");
    formData.append("big_resize", "none");
    formData.append("small_resize", "120x90");

    const uploadResponse = await fetch(
      `${baseUrl}/cgi-bin/ubr_upload.pl?X-Progress-ID=${encodeURIComponent(uploadId)}&upload_id=${encodeURIComponent(uploadId)}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Referer: baseUrl,
          ...formData.getHeaders(),
        },
      }
    );
    const firstData = await uploadResponse.text();
    const viewUrl = cheerio.load(firstData)("input#file_src").val() || "";
    const viewResponse = await fetch(viewUrl);
    const finalData = await viewResponse.text();
    const downUrl = cheerio.load(finalData)("#d_l").attr("href") || "";
    return {
      creator: "@Samush$_",
      url: downUrl,
    };
  } catch (error) {
    return { creator: "@Samush$_", url: null };
  }
}

async function AppleDL(appleMusicUrl) {
  try {
    const encodedUrl = encodeURIComponent(appleMusicUrl);
    const infoRes = await axios.get(`https://apple-music-track.koyeb.app/api/apple-info?url=${encodedUrl}`, {
      headers: {
        'accept': 'application/json'
      }
    });
    const trackInfo = infoRes.data;
    const downloadRes = await axios.get(`https://apple-music-track.koyeb.app/api/apple-download?url=${encodedUrl}&quality=128`, {
      headers: {
        'accept': 'application/json'
      }
    });
    return {
      creator: "@Atem",
      success: true,
      title: trackInfo.title,
      artist: trackInfo.artist,
      image: trackInfo.imagen, 
      created: trackInfo.fecha,
      dl_url: `https://apple-music-track.koyeb.app${downloadRes.data.url}`
    };

  } catch (error) {
    return { success: false, error: "://" };
  }
}

/*
async function AppleDL(urls) {
  const body = `------WebKitFormBoundary2kkVxp8sbzLPyeWd\r\nContent-Disposition: form-data; name="url"\r\n\r\n${urls}\r\n------WebKitFormBoundary2kkVxp8sbzLPyeWd\r\nContent-Disposition: form-data; name="_AMwUE"\r\n\r\n92c6f8727f94b2b2070680dc2502e89a\r\n------WebKitFormBoundary2kkVxp8sbzLPyeWd--\r\n`;

  try {
    const response = await fetch(`https://aplmate.com/action`, {
      method: 'POST',
      headers: {
        "accept": "",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary2kkVxp8sbzLPyeWd",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "session_data=65b2ff4654329cda98b8a58ac46987df; _ga=GA1.1.547033333.1738352682; __gads=ID=8080de2045efa100:T=1738352683:RT=1738352683:S=ALNI_MZPYh4C6WqfUthM5CxYideZJfnJXQ; __gpi=UID=0000100740e2804e:T=1738352683:RT=1738352683:S=ALNI_MaMNtKUdHDN43FlkvLm7_DdF8goWw; __eoi=ID=99bd0ceb5137629a:T=1738352683:RT=1738352683:S=AA-AfjZMqsR8JvNHPyLOuDaFQcHi; FCNEC=%5B%5B%22AKsRol891HT2PBlEmvsYyPi416DVNQ5JiKNtFngmvqKEibruB_sGWLrzlMb84U2TI3LSRds0ZqGyM-l3bupeO2pRafkueHm48_PKBSoJOlkB8tTapR2QHLDuCtoQrHAze8hk-l83Q5vr879YR4zdG47kiTOtBqCwAA%3D%3D%22%5D%5D; _ga_REPKZMQMMQ=GS1.1.1738352682.1.0.1738352955.0.0.0",
        "Referer": "https://aplmate.com/es",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      body: body
    });

    const jsonResponse = await response.json();
    const htmlContent = jsonResponse.html;
    const titleMatch = htmlContent.match(/<div class="hover-underline" style="color: inherit;" title="([^"]+)">/);
    const title = titleMatch ? titleMatch[1] : '';
    const imageMatch = htmlContent.match(/<img src="([^"]+)" class="[^"]*" alt="([^"]+)">/);
    const image = imageMatch ? imageMatch[1] : '';
    const dataMatch = htmlContent.match(/<input type="hidden" name="data" value='([^']+)'/);
    const tokenMatch = htmlContent.match(/<input type="hidden" name="token" value="([^"]+)"/);
    const baseUrlMatch = htmlContent.match(/<input type="hidden" name="base" value="([^"]+)"/);
    
    const data = dataMatch ? dataMatch[1] : '';
    const token = tokenMatch ? tokenMatch[1] : '';
    const baseUrl = baseUrlMatch ? baseUrlMatch[1] : '';

    const secondResponse = await fetch("https://aplmate.com/action/track", {
      method: 'POST',
      headers: {
        "accept": "",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundarygHqj8sV7tdA1zw6U",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "session_data=65b2ff4654329cda98b8a58ac46987df; _ga=GA1.1.547033333.1738352682; __gads=ID=8080de2045efa100:T=1738352683:RT=1738352683:S=ALNI_MZPYh4C6WqfUthM5CxYideZJfnJXQ; __gpi=UID=0000100740e2804e:T=1738352683:RT=1738352683:S=ALNI_MaMNtKUdHDN43FlkvLm7_DdF8goWw; __eoi=ID=99bd0ceb5137629a:T=1738352683:RT=1738352683:S=AA-AfjZMqsR8JvNHPyLOuDaFQcHi; FCNEC=%5B%5B%22AKsRol891HT2PBlEmvsYyPi416DVNQ5JiKNtFngmvqKEibruB_sGWLrzlMb84U2TI3LSRds0ZqGyM-l3bupeO2pRafkueHm48_PKBSoJOlkB8tTapR2QHLDuCtoQrHAze8hk-l83Q5vr879YR4zdG47kiTOtBqCwAA%3D%3D%22%5D%5D; _ga_REPKZMQMMQ=GS1.1.1738352682.1.0.1738352955.0.0.0",
        "Referer": "https://aplmate.com/es",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      body: `------WebKitFormBoundarygHqj8sV7tdA1zw6U\r\nContent-Disposition: form-data; name="data"\r\n\r\n${data}\r\n------WebKitFormBoundarygHqj8sV7tdA1zw6U\r\nContent-Disposition: form-data; name="base"\r\n\r\n${baseUrl}\r\n------WebKitFormBoundarygHqj8sV7tdA1zw6U\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------WebKitFormBoundarygHqj8sV7tdA1zw6U--\r\n`
    });

    const secondJsonResponse = await secondResponse.json();
    const $ = cheerio.load(secondJsonResponse.data);
    const artist = $('p span').text();
    const mp3Link = $('a:contains("Download Mp3")').attr('href');

    return {
      creator: "@Samush$_",
      title,
      artist,
      thumbnail: image,
      dl_url: "https://aplmate.com" + mp3Link
    };
  } catch (error) {
  }}
  */

async function fbdls(fblink) {
  try {
    const response = await fetch(`https://fdownload.app/api/ajaxSearch`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://fdownload.app/es",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      body: `p=home&q=${fblink}&lang=es&w=`
    });

    const data = await response.json(); 
    const $ = cheerio.load(data.data); 
    const results = []
    $('tr').each((index, element) => {
      const quality = $(element).find('.video-quality').text().trim()
      const link = $(element).find('a').attr('href')
      if (quality && link) {
        const result = {
          creator: "@Samush$_",
          quality: quality,
        }
        if (quality.includes("720p")) {
          result.link_hd = link;
        } else if (quality.includes("360p")) {
          result.link_sd = link;
        }
        results.push(result)
      }
    })
    return results;
  } catch (error) {
  }
}

const domain = "https://www.tikwm.com/";

const tikVideo = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isUrl = (str) => /^https?:\/\//.test(str);
      if (!isUrl(url) || !/tiktok\.com/i.test(url))
        throw new Error("Invalid URL: " + url);

      const res = await axios.post(
        domain + "/api/",
        {},
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
              '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
          },
          params: {
            url: url,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1,
          },
        },
      );

      if (res?.data?.code === -1) {
        resolve(res?.data);
      } else {
        resolve({
          creator: "@Samush_$",
          ...updateUrls(res.data?.data),
        });
      }
    } catch (error) {
      resolve({
        status: 404,
        msg: error?.message,
      });
    }
  });
};

const tikUser = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.post(
        domain + "/api/user/posts",
        {},
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
              '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
          },
          params: {
            unique_id: user,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1,
          },
        }
      );

      const videos = res.data?.data?.videos;
      if (!videos || videos.length < 1) {
        return resolve({
          data: {
            creator: "@Samush_$",
            videos: [],
            lastVideo: null,
          },
        });
      }

      const lastVideo = videos.sort((a, b) => b.create_time - a.create_time)[0];

      resolve({
        status: 200,
        data: {
          creator: "@Samush_$",
          videos: videos.map((x) => updateUrls(x)),
          lastVideo: updateUrls(lastVideo),
        },
      });
    } catch (error) {
      resolve({
        status: 404,
        msg: error?.message,
      });
    }
  });
};

async function getLyrics(query) {
    const url = `https://api.vyturex.com/lyrics?query=${query}`
    try {
        const response = await axios.get(url)
        const data = response.data
        return {
            creator: 'Samush',
            title: data.title,
            image: data.image,
            artist: data.artist,
            lyrics: data.lyrics
        }
    } catch (error) {
        return null
    }
}

const tikSearch = async (text) => {
  try {
    const res = await axios.post(
      'https://www.tikwm.com/api/feed/search',
      new URLSearchParams({
        keywords: text,
        count: 50,
        cursor: 0,
        web: 1,
        hd: 1,
      }),
      {
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
        }
      }
    );

    const videos = res.data?.data?.videos;
    if (!videos || videos.length < 1) {
      return { status: 200, data: [] };
    }

    return {
      creator: "@Samush$_",
      status: 200,
      data: videos.map((video) => ({
        author: video.author.unique_id,
        video_id: video.id,
        region: video.region,
        title: video.title,
        cover: `https://www.tikwm.com/video/cover/${video.id}.webp`,
        duration: video.duration,
        id: video.id,
        url: `https://www.tiktok.com/@${video.author.unique_id}/video/${video.id}`,
        views: video.play_count,
        likes: video.digg_count,
        comments: video.comment_count,
        share: video.share_count,
        create_time: video.create_time,
        download: video.download_count,
        nowm: `https://www.tikwm.com/video/media/play/${video.id}.mp4`,
        wm: `https://www.tikwm.com/video/media/wmplay/${video.id}.mp4`,
        music: `https://www.tikwm.com/video/music/${video.id}.mp3`,
      })),
    };
  } catch (error) {
    return { status: 404, msg: error?.message };
  }
};


function updateUrls(obj) {
  const regex =
    /("avatar": "|music": "|play": "|wmplay": "|hdplay": "|cover": ")(\/[^"]+)/g;
  const updatedData = JSON.stringify(obj, null, 2).replace(
    regex,
    (match, p1, p2) => p1 + domain + p2
  );
  return JSON.parse(updatedData);
}


async function manga(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'private, max-age=0',
        'etag': 'W/"2e51cb54458b67ea23c65e9ebf866f60df9b96c59d46dd2a17184836901f80fa"',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'content-length': '0',
        'server': 'GSE'
      }
    });
    const $ = cheerio.load(response.data);
    let title = $('meta[name="title"]').attr('content');
    let desc = $('meta[name="description"]').attr('content');
    let link = $('h3.post-title.entry-title a').attr('href');
    let images = [];
    $('div.separator a').each((index, element) => {
      let posts = $(element).attr('href');
      images.push(posts);
    });
    return {
      creator: "@Samush_$",
      title,
      desc,
      link,
      images
    };
  } catch (error) {
    return null;
  }
}

const generateRandomIP = () => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

const generateRandomUserAgent = () => {
    const androidVersions = ['4.0.3', '4.1.1', '4.2.2', '4.3', '4.4', '5.0.2', '5.1', '6.0', '7.0', '8.0', '9.0', '10.0', '11.0'];
    const deviceModels = ['M2004J19C', 'S2020X3', 'Xiaomi4S', 'RedmiNote9', 'SamsungS21', 'GooglePixel5'];
    const buildVersions = ['RP1A.200720.011', 'RP1A.210505.003', 'RP1A.210812.016', 'QKQ1.200114.002', 'RQ2A.210505.003'];
    const selectedModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
    const selectedBuild = buildVersions[Math.floor(Math.random() * buildVersions.length)];
    const chromeVersion = `Chrome/${Math.floor(Math.random() * 80) + 1}.${Math.floor(Math.random() * 999) + 1}.${Math.floor(Math.random() * 9999) + 1}`;
    const userAgent = `Mozilla/5.0 (Linux; Android ${androidVersions[Math.floor(Math.random() * androidVersions.length)]}; ${selectedModel} Build/${selectedBuild}) AppleWebKit/537.36 (KHTML, like Gecko) ${chromeVersion} Mobile Safari/537.36 WhatsApp/1.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}`;
    return userAgent;
}

const generateRandomHex = (size) => {
    const characters = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < size; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const gptWordle = async (content, prompt) => {
    try {
        const data = {
            user: generateRandomHex(16),
            messages: [{
                    role: "user",
                    content: prompt
                },
                {
                    role: "assistant",
                    content: content
                }
            ],
            subscriber: {
                originalAppUserId: `$RCAnonymousID:${generateRandomHex(32)}`,
                requestDate: new Date().toISOString(),
                firstSeen: new Date().toISOString(),
            }
        }
        const response = await axios.post("https://wewordle.org/gptapi/v1/web/turbo", data, {
            headers: {
                'accept': '*/*',
                'pragma': 'no-cache',
                'Content-Type': 'application/json',
                'Connection': 'keep-alive',
                "user-agent": generateRandomUserAgent(),
                "x-forwarded-for": generateRandomIP()
            }
        })
        return response.data;
    } catch (error) {
        throw error;
    }
}
let USER_SYSTEM_PROMPT = "Eres una ia llamada blackbox";
const WEB_SEARCH_MODE = true;
const PLAYGROUND_MODE = false;
const CODE_MODEL_MODE = false;
const IS_MIC_MODE = false;

class Blackbox {
  constructor() {
    this.userId = 'Samu@_320';
    this.chatId = '@SophiDev';
  }
  
  async chat(messages, userSystemPrompt = USER_SYSTEM_PROMPT, webSearchMode = WEB_SEARCH_MODE, playgroundMode = PLAYGROUND_MODE, codeModelMode = CODE_MODEL_MODE, isMicMode = IS_MIC_MODE) {
    try {
      const blackboxResponse = await axios.post('https://www.blackbox.ai/api/chat', {
        messages: messages,
        id: this.chatId || 'chat-free',
        previewToken: null,
        userId: this.userId,
        codeModelMode: codeModelMode,
        agentMode: {},
        trendingAgentMode: {},
        isMicMode: isMicMode,
        userSystemPrompt: userSystemPrompt,
        maxTokens: 1024,
        playgroundMode: playgroundMode,
        webSearchMode: webSearchMode,
        promptUrls: '',
        isChromeExt: false,
        githubToken: null
      }, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://www.blackbox.ai/',
          'Content-Type': 'application/json',
          Origin: 'https://www.blackbox.ai',
          DNT: '1',
          'Sec-GPC': '1',
          'Alt-Used': 'www.blackbox.ai',
          Connection: 'keep-alive'
        }
      });
      return blackboxResponse.data;
    } catch (error) {
      
    }
  }
}

const InstagramStory = (User) => {
    return new Promise((resolve, reject) => {
        axios(`https://igs.sf-converter.com/api/profile/${User}`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "origin": "https://id.savefrom.net",
                "referer": "https://id.savefrom.net/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Windows; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
            }
        }).then(({ data }) => {
            let id = data.result.id;
            axios(`https://igs.sf-converter.com/api/stories/${id}`, {
                method: "GET",
                headers: {
                    "accept": "*/*",
                    "origin": "https://id.savefrom.net",
                    "referer": "https://id.savefrom.net/",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Windows; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
                }
            }).then(({ data }) => {
                let result = [];
                data.result.forEach((obj) => {
                    let image_url, video_url;
                    obj?.image_versions2?.candidates?.forEach((candidate) => {
                        if (candidate.width === 1080) {
                            image_url = candidate.url;
                        }
                    });
                    obj?.video_versions?.forEach((video) => {
                        if (video.type === 101) {
                            video_url = video.url;
                        }
                    });
                    let fileType = obj.video ? 'mp4' : 'jpg';
                    let newObject = {
                        "type": fileType,
                        "url": obj.video ? video_url : image_url
                    };
                    result.push(newObject);
                });

                let responseData = {
                    "creator": `@${User}`,
                    "status": true,
                    "data": result
                };

                resolve(responseData);
            }).catch(reject);
        }).catch(reject);
    });
};

async function searchYouTube(query) {
  try {
    const results = await yts(query);

    const formattedResults = results.videos.map(video => {
      return {
        title: video.title,
        duration: video.timestamp,
        id: video.videoId,
        views: video.views,
        author: video.author.name,
        channel: video.author.url,
        thumbnail: video.thumbnail,  
        description: video.description,
        url: video.url
      };
    });

    return {
      creator: "@Samush_$",
      results: formattedResults
    };

  } catch (error) {
    
  }
}

async function youtubeMp4(url) {
  try {
    
    function extractVideoId(url) {
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:be\.com\/(?:watch\?(?:v=|vi=)|v\/|vi\/)|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)|youtube\.com\/\?(?:v=|vi=))([\w-]{11})/
      const match = regex.exec(url)
      return match ? match[1] : null
    }
    const params = new URLSearchParams()
    params.append("url", cleanUrl)

    const headers = {
      'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
      'X-Requested-With': "XMLHttpRequest"
    }

    const videoResponse = await axios.post("https://tools.revesery.com/youtube/download.php", params, { headers })
    const videoLinkMatch = videoResponse.data.match(/<a href="([^"]+)" download/)
    const videoLink = videoLinkMatch ? videoLinkMatch[1] : null

    
    return {
      creator: "@Samush_$",
      video: videoLink 
    }

  } catch (error) {
    
  }
}


/*async function youtubeMp4(url) {
  const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:be\.com\/(?:watch\?(?:v=|vi=)|v\/|vi\/)|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)|youtube\.com\/\?(?:v=|vi=))([\w-]{11})/;
    const match = regex.exec(url);
    return match ? match[1] : null;
  };
  const checkThumbnailAvailability = async (thumbnailUrl) => {
    try {
      await axios.get(thumbnailUrl);
      return true;
    } catch {
      return false;
    }
  };

  const videoId = extractVideoId(url);
  const apiUrl = `https://api.kyuurzy.site/api/download/aio?query=${url}`;
  try {
    const response = await axios.get(apiUrl);
    const parsedData = response.data;

    if (parsedData.status && parsedData.result && parsedData.result.url) {
      const thumbnailLow = `https://img.youtube.com/vi/${videoId}/default.jpg`;
      const thumbnailMedium = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      const thumbnailHigh = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const thumbnailAvailable = await checkThumbnailAvailability(thumbnailHigh);

      return {
        creator: "@Samush_$",
        id: videoId,
        thumbnails: {
          low: thumbnailLow,
          medium: thumbnailMedium,
          high: thumbnailAvailable ? thumbnailHigh : null,
        },
        url: `https://youtube.com/watch?v=${videoId}`,
        download: parsedData.result.url
      };
    } else {
      throw new Error('://');
    }
  } catch (error) {
    
  }
}*/

async function fetchZedgeWallpapers(url, maxResults) {
    try {
        let results = [];
        let currentPage = 1;
        let loadMore = true;

        while (results.length < maxResults && loadMore) {
            const response = await axios.get(`${url}?page=${currentPage}`);
            const html = response.data;
            const $ = cheerio.load(html);

            $('div.sc-cdZahM').each((index, element) => {
                const href = $(element).find('a.sc-ejVUYw').attr('href');
                const title = $(element).find('a.sc-ejVUYw').text();
                if (href && title) {
                    const img = `${href}`;
                    results.push({ title, img });
                }
            });
            loadMore = $('div.sc-fnykZs.gVtTIF button').text() === 'Load more';
            currentPage++;
        }

        return results.slice(0, maxResults);
    } catch (error) {
    }
}

async function mapZedgeWallpapers(text) {
    const baseUrl = `https://www.zedge.net/find/wallpapers/${text}`;
    const maxResults = 30;
    try {
        const results = await fetchZedgeWallpapers(baseUrl, maxResults);

        if (results && results.length > 0) {
            return results.map((result, index) => ({
                creator: 'Samush',
                title: result.title,
                link: result.img
            }));
        } else {
        }
    } catch (error) {
        
    }
}

async function rings(url, maxResults) {
    try {
        let results = [];
        let currentPage = 1;
        let loadMore = true;

        while (results.length < maxResults && loadMore) {
            const response = await axios.get(`${url}?page=${currentPage}`);
            const html = response.data;
            const $ = cheerio.load(html);

            $('div.sc-ldZUWu.scvwE a').each((index, element) => {
                const link = $(element).attr('href');
                const title = $(element).text();
                if (link.includes('/ringtone/')) {
                    results.push({ creator: 'Samu', title, link });
                }
            });
            loadMore = $('div.sc-fnykZs.gVtTIF button').text() === 'Load more';
            currentPage++;
        }

        return results.slice(0, maxResults); 
    } catch (error) {
    }
}

async function mapZedgeResults(text) {
    const baseUrl = 'https://www.zedge.net/find/';
    const maxResults = 30;
    const url = `${baseUrl}${encodeURIComponent(text)}`;
    try {
        const results = await rings(url, maxResults);
        if (results && results.length > 0) {
            return results.map((result, index) => ({
                creator: 'Samush',
                title: result.title,
                link: result.link
            }));
        } else {
        }
    } catch (error) {
    }
}        


const MyMusicSearch = async (query) => {
  try {
    let { searchMusics } = await import('node-youtube-music');
    let musics = await searchMusics(query);
    let results = musics.map(music => ({
      creator: "Samush",
      title: music.title,
      artists: music.artists.map(artist => artist.name),
      duration: music.duration,
      album: music.album,
      thumbnail: music.thumbnailUrl,
      id: music.youtubeId,
      link: `https://music.youtube.com/watch?v=${music.youtubeId}`
    }));
    return results;
  } catch (error) {
    
  }
};

async function getTrendingVideos(region = 'US') {
  try {
    let url = `https://www.tikwm.com/api/feed/list?region=${region}`;
    let res = await axios.get(url);
    let data = res.data;
    if (data.code === 0) {
      const videos = data.data;
      const trendingVideos = videos.map(video => ({
        creator: "Samush",
        id: video.video_id,
        title: video.title,
        region: video.region,
        cover: video.cover,
        ai_dynamic_cover: video.ai_dynamic_cover,
        origin_cover: video.origin_cover,
        duration: video.duration,
        repros: video.play_count,
        likes: video.digg_count,
        comment: video.comment_count,
        shares: video.share_count,
        downloads: video.download_count,
        publisehd: new Date(video.create_time * 1000),
        author: video.author,
        nowm: video.play,
        wm: video.wmplay,
        music: video.music,
      }));
      return trendingVideos;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function shazamv2(url) {
    try {
        const response = await axios.get('https://shazam-song-recognition-api.p.rapidapi.com/recognize/url', {
            params: { url },
            headers: {
                'x-rapidapi-key': '55dda3079amsh105aa37ae010fd2p1ac204jsnb424bf6bd3e6',
                'x-rapidapi-host': 'shazam-song-recognition-api.p.rapidapi.com',
            }
        })
        const data = response.data
        return {
            creator: "@Samush$_",
            data: {
                title: data.track.title,
                artist: data.track.subtitle,
                avatar: data.track.share.avatar,
                thumbnail: data.track.share.image,
                gender: data.track.genres.primary,
                type: data.track.type,
                url: data.track.url,
            }
        };
    } catch (error) {
        return {
            creator: "@Samush$_",
            error: '://'
        };
    }
}

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const apiInstance = axios.create({
  baseURL: "https://api.kome.ai",
  headers: {
    "Content-Type": "application/json",
    "Referer": "https://api.kome.ai"
  }
});

const youtubeTranscript = async (videoId) => {
  try {
    const response = await apiInstance.post("/api/tools/youtube-transcripts", {
      video_id: videoId,
      format: true
    });
    return response.data.transcript;
  } catch (error) {
    throw error;
  }
};

async function downloadIfunnyMedia(url) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://www.expertsphp.com/download.php',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: `url=${encodeURIComponent(url)}`
        });

        const html = response.data.toString();
        const videoRegex = /<td><a href="([^"]+\.mp4)"[^>]*>Download Link<\/a><\/td>\s*<td><strong>(\d+p)<\/strong><\/td>\s*<td><strong>(video\/mp4)<\/strong><\/td>/;
        const imageRegex = /<td><a href="([^"]+\.(jpg|png|gif))"[^>]*>Download Link<\/a><\/td>\s*<td><strong>---<\/strong><\/td>\s*<td><strong>(image\/\w+)<\/strong><\/td>/;
        const videoMatch = html.match(videoRegex);
        const imageMatch = html.match(imageRegex);
        const result = {};
        if (videoMatch) {
            result.video = {
                url: videoMatch[1],
                quality: videoMatch[2],
                format: videoMatch[3]
            };
        }

        if (imageMatch) {
            result.image = {
                url: imageMatch[1],
                format: imageMatch[3]
            };
        }

        return result;
    } catch (error) {
        
    }
}

async function fetchZedgeContentDetails(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html)
        let content = {};
        const imageUrlScript = $('script[type="application/ld+json"]').last().text();
        if (imageUrlScript) {
            const imageObject = JSON.parse(imageUrlScript);
            if (imageObject && imageObject['@type'] === 'ImageObject' && imageObject.contentUrl) {
                const imageUrl = imageObject.contentUrl;
                const imageSizeResponse = await axios.head(imageUrl);
                const imageSize = parseInt(imageSizeResponse.headers['content-length'], 10);
                content = {
                    creator: 'Samush',
                    type: 'image/jpeg',
                    size: formatSize(imageSize),
                    url: imageUrl,
                };
                return content;
            }
        }
        const downloadUrlRingtone = $('meta[property="og:audio"]').attr('content');
        if (downloadUrlRingtone) {
            const ringtoneSizeResponse = await axios.head(downloadUrlRingtone);
            const ringtoneSize = parseInt(ringtoneSizeResponse.headers['content-length'], 10);
            content = {
                creator: '@Samush_$',
                type: 'mpeg/audio',
                size: formatSize(ringtoneSize),
                url: downloadUrlRingtone,
            };
            return content;
        }
        return null;
    } catch (error) {
        throw error; 
    }
}
const formatSize = (bytes) => {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' bytes';
};

function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:be\.com\/(?:watch\?(?:v=|vi=)|v\/|vi\/)|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)|youtube\.com\/\?(?:v=|vi=))([\w-]{11})/;
  const match = regex.exec(url);
  return match ? match[1] : null;
}
const dlmp3 = async (url) => {
  try {
    const videoId = extractVideoId(url);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    let thumbnailAvailable = false;
    try {
      const thumbResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
      if (thumbResponse.status === 200) {
        thumbnailAvailable = true;
      }
    } catch (error) {
      
    }
    const serverResponse = await axios.post("https://proxy.ezmp3.cc/api/getServer", {}, {
      headers: { "Content-Type": "application/json" }
    });
    const { serverURL } = serverResponse.data;
    const convertResponse = await axios.post(`${serverURL}/api/convert`, {
      url: url,
      quality: 128,
      trim: false,
      startT: 0,
      endT: 0,
      videoLength: 4,
      restricted: false,
      code: 0
    }, {
      headers: { "Content-Type": "application/json" }
    });
    const { title = new Date().toISOString(), url: downloadUrl } = convertResponse.data;
    const headRes = await axios.head(downloadUrl);
    const contentType = headRes.headers['content-type'];
    if (headRes.status === 200 && (contentType.startsWith("video") || contentType.startsWith("audio"))) {
      const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(fileResponse.data);
      return {
        creator: "@Samush_$",
        title: title,
        size: formatSize(buffer.length),
        thumbnail: thumbnailAvailable ? thumbnailUrl : null,
        url: downloadUrl
      };
    } else {
      return null;
    }
  } catch (error) {
    
  }
};

async function fetchTeraboxLink(url) {
  const options = {
    method: 'POST',
    url: 'https://terabox-downloader-direct-download-link-generator.p.rapidapi.com/fetch',
    headers: {
      'x-rapidapi-key': '55dda3079amsh105aa37ae010fd2p1ac204jsnb424bf6bd3e6',
      'x-rapidapi-host': 'terabox-downloader-direct-download-link-generator.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      url: url
    }
  };

  try {
    const response = await axios.request(options);
    const responseData = response.data;
    const filteredData = responseData.map(item => ({
      creator: '@Samush_$',
      name: item.server_filename,
      md5: item.md5,
      size: formatBytes(item.size),
      id: item.share_id,
      link: item.dlink,
      fast: item.fastdlink
    }));
    return filteredData;
  } catch (error) {
    
  }
}


function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function drcs(duration) {
  if (!duration) return null
  let regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  let match = duration.match(regex)
  if (!match) return duration
  let hours = match[1] ? parseInt(match[1], 10) : 0
  let minutes = match[2] ? parseInt(match[2], 10) : 0
  let seconds = match[3] ? parseInt(match[3], 10) : 0
  let formatted = ''
  if (hours > 0) formatted += `${hours} horas `
  if (minutes > 0) formatted += `${minutes} minutos `
  if (seconds > 0 || formatted === '') formatted += `${seconds} segundos`
  return formatted.trim()
}
function dates(dts) {
if (!dts) return null
let months = [ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ]
let date = new Date(dts)
let day = date.getUTCDate()
let month = months[date.getUTCMonth()]
let year = date.getUTCFullYear()
return `el ${day} de ${month} del ${year}`
}

async function getSchemaData(url) {
try {
let js = await axios.get(url)
let $ = cheerio.load(js.data)
let chemas = $('script[type="application/ld+json"]').html()
if (chemas) {
let dls = JSON.parse(chemas)
return {
creator: "@Samush_$",
name: dls.name || "",
author: dls.author || "",
thumbnail: dls.thumbnailUrl ? dls.thumbnailUrl[0] : "",
published: dates(dls.uploadDate) || null,
duration: drcs(dls.duration) || "",
download: dls.contentUrl || ""
}} else {
return {}
}} catch (error) {
return {}
}}

async function pindls(pinurl) {
    try {
        let app = await axios.get('https://www.savepin.app/download.php', {
            params: { url: pinurl, lang: 'es', type: 'redirect' },
            headers: {
                'Accept': '',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        let html = app.data;
        let thumbnail = /<img\s+src="([^"]+)"/g;
        let mp4 = /<tr>\s*<td class="video-quality">([^<]+)<\/td>[^<]+<td[^>]+>(MP4)<\/td>[^<]+<td>[^>]+href="([^"]+)"/g;
        let dls = [];
        let match;

        while ((match = thumbnail.exec(html)) !== null) {
            let url = match[1];
            if (url.startsWith('http')) {
                dls.push({ creator: '@Samush_$', type: 'image', url });
            }
        }

        while ((match = mp4.exec(html)) !== null) {
            let quality = match[1].trim();
            let format = match[2].trim();
            let decode = match[3].trim();
            const mdl = decodeURIComponent(decode.split('url=')[1]);
            dls.push({ creator: '@Samush_$', type: 'video', quality, format, url: mdl });
        }

        return dls;

    } catch (error) {
        return `://`;
    }
}

async function SpotifyTracks(url) {
  try {
    let urll = url.includes("spotify.link") ? (await axios.get(url)).request.res.responseUrl : url;
    
    let [mtd, dls] = await Promise.all([
      axios.post('https://spotydown.media/api/get-metadata', { url: urll }),
      axios.post('https://spotydown.media/api/download-track', { url: urll })
    ]);

    return {
      creator: "@Samush$_",
      title: mtd.data.apiResponse.data[0].name,
      artist: mtd.data.apiResponse.data[0].artist,
      album: mtd.data.apiResponse.data[0].album,
      thumbnail: mtd.data.apiResponse.data[0].cover_url,
      spotify: mtd.data.apiResponse.data[0].url,
      music: dls.data.file_url
    }
  } catch (error) {
    
  }
}

async function analistics(imageUrl) {
  try {
    const imgs = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(imgs.data, 'binary')
    const buffs = buffer.toString('base64')

    const response = await axios.get('https://attractivenesstest.com/face_shape')
    const page = response.data
    const $ = cheerio.load(page)

    const form = new URLSearchParams()
    form.append('imageFile', '')
    form.append('canvasimg', '')
    form.append('image_data', `data:image/jpeg;base64,${buffs}`)

    const resultResponse = await axios.post('https://attractivenesstest.com/result_shape', form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const results = resultResponse.data
    const $result = cheerio.load(results)

    const facess = $result('h4.card-title span.badge').text().trim()
    const grs = $result('p.card-text').text().trim()
    const genero = grs.replace('Detected gender:', '').trim()

    const gnrs = {
      'female': 'femenino',
      'male': 'masculino'
    }
    const gender = gnrs[genero] || ''

    const trdfcs = {
      'Oval': 'Ovalado',
      'Round': 'Redondo',
      'Square': 'Cuadrado',
      'Heart': 'Corazón',
      'Diamond': 'Diamante',
    }
    const fcs = trdfcs[facess] || ''

    return {
      creator: "@Samush_$",
      results: {
        form: fcs,
        gender: gender
      }
    }
  } catch (error) {
    return {
      creator: "@Samush_$",
      error: '://'
    }
  }
}

async function facecelyb(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'binary')
    const imageData = buffer.toString('base64')

    const form = new URLSearchParams()
    form.append('imageFile', '')
    form.append('canvasimg', '')
    form.append('image_data', `data:image/jpeg;base64,${imageData}`)

    const result = await axios.post('https://mycelebritylookalike.com/result', form.toString(), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const data = result.data
    const $ = cheerio.load(data)

    const lookalikeName = $('div.col-md-8.text-center h4').text().replace('Your Celebrity Lookalike is', 'Tienes un Parecido Con').trim()
    const lookalikeImage = $('div.col-md-8.text-center img.card-img-top').attr('src')
    const similarityText = $('div.col-md-8.text-center p.card-text').text().trim()
    const similarityMatch = similarityText.match(/(\d+)%/)
    const similarity = similarityMatch ? `${similarityMatch[1]}%` : ''
    const others = []

    $('.row .card-img-top').each((index, element) => {
      const name = $(element).attr('alt')
      const image = $(element).attr('src')
      others.push({ name, image })
    })

    if (others.length > 0 && others[0].image === lookalikeImage) {
      others.shift()
    }

    return {
      creator: '@Samush_$',
      name: lookalikeName,
      image: lookalikeImage,
      similar: similarity,
      others,
    }
  } catch (error) {
    return {
      creator: '@Samush_$',
      error: '://'
    }
  }
}

async function scrapeAgeGuess(imageUrl) {
  try {
    const { data: imageBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    const form = new URLSearchParams()
    form.append('imageFile', '')
    form.append('canvasimg', '')
    form.append('image_data', `data:image/jpeg;base64,${base64Image}`)
    
    const { data: resultHtml } = await axios.post('https://howolddoyoulook.com/result', form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
    })

    const $ = cheerio.load(resultHtml)
    let ageText = $('h5.blue-grey-text').text().trim()
    
    const ageMatch = ageText.match(/(\d+)\s+years\s+old/)
    const ageInSpanish = ageMatch ? `Pareces de ${ageMatch[1]} años` : ''
    
    const percentageStyle = $('.skill.html').attr('style')
    const percentage = percentageStyle ? percentageStyle.match(/width:(\d+\.?\d*)%/)?.[1] : ''
    const roundedPercentage = percentage !== '' ? Math.round(parseFloat(percentage)) : ''
    return {
      creator: "@Samush_$",
      result: {
        info: ageInSpanish,
        calculated: roundedPercentage,
      },
    }
  } catch (error) {
    
  }
}

async function youtubedl(url) {
  try {
    var server = await fetch(`https://cdn58.savetube.me/info?url=${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    var dls = await server.json();
    var { thumbnail, durationLabel, title, titleSlug, url, key } = dls.data;

    var server2 = await fetch(`https://cdn53.savetube.me/download/audio/128/${key}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    var sph = await server2.json();
    var audio = sph.data.downloadUrl;

    return {
      creator: "@Samush$_",
      title,
      thumbnail,
      duration: durationLabel,
      link: url,
      audio
    };
  } catch (error) {
    
  }
}

async function ttsv(url) {
    try {
        let data = {
            query: url,
            language_id: '1',
        };
        let res = await axios.post('https://ttsave.app/download', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const $ = cheerio.load(res.data);
       
        const username = $('a[title]').text();
        const user = $('#unique-id').val();
        const title = $('.oneliner').text();
        const music = $('a[href*=".mp3"]').attr('href');
        const profile = $('a[href*="avatar"]').attr('href');
        
        const images = [];
        $('a[href*="tos-maliva-i-photomode"]').each((i, el) => {
            images.push($(el).attr('href'));
        });

        return {
            creator: "@Samush_$",
            title,
            username,
            user,
            music,
            profile,
            images
        };
    } catch (error) {
        
    }
}

async function playstoreDL(url) {
    var paramers = new URL(url).searchParams
    var packageId = paramers.get('id')
    var data = new URLSearchParams()
    data.append('efeedfeccd', '1728703173')
    data.append('fcebacedbfc', packageId)
    data.append('ffefabccaefafb', 'WNjRvIn2NCu_aF7_QH8BHg')
    data.append('fetch', 'false')
    try {
        var server = await axios.post(`https://api-apk.evozi.com/download`, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Cache-Control': 'no-cache, private',
            }
        })
        var json = server.data
        let dl_url = `https://${json.url}`
        return {
            creator: "@Samush$_",
            package: json.packagename,
            size: json.filesize,
            version: json.version,
            fetched_at: json.fetched_at,
            file_type: json.file_type,
            url: dl_url
        }
    } catch (error) {
        
    }
}

async function saveporn(url) {
  try {
    const server = await fetch('https://www.saveporn.net/convert/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ 'url': url }),
    })
    const html = await server.text()
    const $ = cheerio.load(html)
    const title = $('section.e.j.d2.dsection h2.o2').text().trim()
    const thumb = $('div.thumbdiv img').attr('data-src')
    const dls = []
    $('table tr').each((i, elem) => {
      const quality = $(elem).find('td').eq(0).text().trim()
      const format = $(elem).find('td').eq(1).text().trim()
      const link = $(elem).find('a').attr('href')
      dls.push({ quality, format, link })
    })
    return {
      creator: "@Samush$_",
      title,
      thumb,
      dl_url: dls,
    }
  } catch (error) {
  }}

async function snapdl(snapchatUrl) {
  const apiUrl = "https://www.tikefy.com/api/pre_download?t=1741056548098";

  const headers = {
    "accept": "application/json, text/plain, ",
    "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://dl.valaok.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  const body = JSON.stringify({
    url: snapchatUrl,
    download_type: "Snapchat"
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body
    })
    const json = await response.json()
    return {
      creator: "@Samush$_",
      data: {
      url: "https://www.tikefy.com/api/download?sign=" + json.data?.sign || ""
      }
    }
  } catch (error) {
  }}
/*async function snapdl(link) {
    try {
        var response = await axios.post('https://getindevice.com/wp-json/aio-dl/video-data/', {
            url: link
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://getindevice.com',
                'Access-Control-Allow-Methods': 'POST',
            }
        });

        var data = response.data;
        var medias = data.medias || [];
        var video = medias.length > 0 ? medias[0].url : null;
        var size = medias.length > 0 ? medias[0].formattedSize : null;
        var url = data.url;
        var title = data.title;
        var thumbnail = data.thumbnail;
        var duration = data.duration;

        var infos = {
           creator: "@Samush$_",
            title,
            thumbnail,
            url,
            size,
            video
        }

        return infos;
    } catch (error) {
        
    }
}*/

const modelos = {
    'en_mujer': 'en_us_001',
    'en_hombre': 'en_us_006',
    'en_hombre2': 'en_us_007',
    'en_us_hombre': 'en_us_009',
    'en_us_hombre2': 'en_us_010',
    'en_narrator': 'en_male_narration',
    'en_hombre3': 'en_male_funny',
    'en_mujer_emot': 'en_female_emotional',
    'en_hombre_cody': 'en_male_cody',
    'uk_hombre': 'en_uk_001',
    'uk_hombre2': 'en_uk_003',
    'it_hombre': 'it_male_m18',
    'au_mujer': 'en_au_001',
    'au_hombre': 'en_au_002',
    'fr_hombre': 'fr_001',
    'fr_hombre2': 'fr_002',
    'de_mujer': 'de_001',
    'de_hombre': 'de_002',
    'es_hombre': 'es_002',
    'mx_hombre': 'es_mx_002',
    'br_mujer': 'br_001',
    'br_mujer2': 'br_003',
    'id_mujer': 'id_001',
    'jp_mujer': 'jp_001',
    'jp_mujer2': 'jp_003',
    'jp_mujer3': 'jp_005',
    'jp_hombre': 'jp_006',
    'kr_hombre': 'kr_002',
    'kr_hombre2': 'kr_004',
    'kr_mujer': 'kr_003',
    'ghostface': 'en_us_ghostface',
    'chewbacca': 'en_us_chewbacca',
    'c3po': 'en_us_c3po',
    'stitch': 'en_us_stitch',
    'sing_mujer': 'en_female_f08_salut_damour',
    'sing_mujer3': 'en_female_ht_f08_wonderful_world',
    'sing_mujer2': 'en_female_f03_sunshine_soon',
    'sing_hombre': 'en_male_m03_lobby',
    'sing_hombre2': 'en_male_m03_sunshine_soon',
    'sing_hombre3': 'en_male_sing_funny_it_goes_up',
    'sing_silly': 'en_male_m2_xhxs_m03_silly'
};

async function TikTokVoice(text, voice) {
    try {
        const response = await axios.post('https://gesserit.co/api/tiktok-tts', {
            text: text,
            voice: voice
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const audio = response.data.audioUrl;

        if (audio.startsWith('data:audio/mp3;base64,')) {
            const base64 = audio.replace('data:audio/mp3;base64,', '');
            const buffer = Buffer.from(base64, 'base64');
            return buffer;
        }
    } catch (error) {
    }
    return null;
}

async function getSpotifyDetails(url) {
  try {
    const isPlaylist = url.includes('/playlist/');
    const isAlbum = url.includes('/album/');
    const id = url.split('/').pop().split('?')[0];
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (isPlaylist) {
      const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const playlistData = await playlistResponse.json();
      const trackInfo = playlistData.tracks.items
        .filter(item => item.track) 
        .map(item => ({
          name: item.track.name,
          url: item.track.external_urls.spotify,
        }));

      const imageUrls = playlistData.images.map(image => image.url);

      return {
        creator: "@Samush$_",
        name: playlistData.name,
        type: playlistData.type,
        id: playlistData.id,
        images: imageUrls,
        description: playlistData.description,
        followers: playlistData.followers.total,
        owner: playlistData.owner.display_name,
        tracks: {
          trackss: trackInfo,
          total: playlistData.tracks.total,
        },
      };
    } else if (isAlbum) {
      const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const albumData = await albumResponse.json();

      const image640 = albumData.images.find(image => image.height === 640 && image.width === 640)?.url;
      const tracks = albumData.tracks.items.map(track => ({
        name: track.name,
        url: track.external_urls.spotify,
      }));

      return {
        creator: "@Samush$_",
        name: albumData.name,
        id: albumData.id,
        thumbnail: image640,
        published: albumData.release_date,
        type: albumData.album_type,
        total_tracks: albumData.total_tracks,
        spotify_url: albumData.external_urls.spotify,
        artists: albumData.artists.map(artist => ({
          name: artist.name,
          url: artist.external_urls.spotify,
        })),
        tracks,
      };
    }
  } catch (error) {
    return { error: "://" };
  }
}


async function threadsDL(url) {
    try {
         var server = await fetch(`https://api.threadsphotodownloader.com/v2/media?url=${url}`, {
            method: 'GET',
            headers: {

                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        var svrs = await server.json()
        return {
            creator: "@Samush$_",
            images: svrs.image_urls || [],
            videos: svrs.video_urls ? svrs.video_urls.map(video => video.download_url) : []
        }
    } catch (error) {
    }}
    
    async function tumblr(url) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ url }) 
    };
    try {
        const response = await fetch('https://getindevice.com/wp-json/aio-dl/video-data/', options);
        const data = await response.json(); 
        let enlaces = [];

        if (data && data.medias) {
            data.medias.forEach(media => {
         if (media.extension === 'gifv' || media.url.endsWith('.gifv')) {
          const gifUrl = media.url.replace('.gifv', '.gif');
           enlaces.push(gifUrl); 
                }
                
            });
        }
        return enlaces
    } catch (error) {
        
    }
}

async function CapCutDl(link) {
    try {
        var response = await axios.post('https://vidburner.com/wp-json/aio-dl/video-data/', {
            url: link, 
            format: 'mp4'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://vidburner.com'
            }
        })
        var info = response.data
        var title = info.title
        var thumbnail = info.thumbnail
        var video = info.medias[0]?.url
        var formattedSize = info.medias[0]?.formattedSize
        return {
            creator: "@Samush$_",
            title,
            thumbnail,
            size: formattedSize,
            video
        }
    } catch (error) {
    }}

async function VimeoDL(link) {
    try {
        const response = await axios.post('https://snapfrom.com/wp-json/aio-dl/video-data/', null, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            params: {
                url: link 
            }
        })
        const data = response.data;
        return {
            creator: "@Samush$_",
            title: data.title,
            thumbnail: data.thumbnail,
            duration: data.duration,
            url: data.url,
            medias: data.medias.map(media => ({
                url: media.url,
                formattedSize: media.formattedSize,
                quality: media.quality
            })),
        };
    } catch (error) {
   }}

async function Igstorys(username) {
  try {
    var server = await fetch(`https://anonyig.com/api/ig/story?url=https%3A%2F%2Fwww.instagram.com%2Fstories%2F${username}%2F`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cf-cache-status': 'DYNAMIC',
        'cf-ray': '8d85a7a8f8a61e92-EZE',
        'content-encoding': 'gzip',
        'content-type': 'application/json; charset=utf-8'
      }
    })
    var data = await server.json()
    var urls = data.result.map(story => {
      if (story.video_versions) {
        return { url: story.video_versions[0].url }
      } else {
        return { url: story.image_versions2.candidates[0].url }
      }
    })
    return { creator: "@Samush$_", urls: urls }
  } catch (error) {
    return { error: "://" }
  }
}



/*async function ytdls(query, desiredQuality) {
    const searchUrl = "https://ssvid.net/api/ajax/search";
    const convertUrl = "https://ssvid.net/api/ajax/convert";
    const searchBody = `query=${encodeURIComponent(query)}&vt=home`;

    try {
        const searchResponse = await fetch(searchUrl, {
            method: "POST",
            headers: {
                "accept": "",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: searchBody
        });
        const searchData = await searchResponse.json();
        const vid = searchData.vid;
        const title = searchData.title;

        const qualityMap = {
            "360p": "134",
            "720p": "136",
            "1080p": "137",
            "128kbps": "mp3128"
        };

        const qualityKey = qualityMap[desiredQuality];

        const links = {
            mp4: JSON.stringify(searchData.links.mp4),
            mp3: JSON.stringify(searchData.links.mp3)
        };

        const parsedLinks = {
            mp4: JSON.parse(links.mp4),
            mp3: JSON.parse(links.mp3)
        };

        const videoQuality = parsedLinks.mp4[qualityKey] || parsedLinks.mp3[qualityKey];
        const { k, size } = videoQuality;
        const convertBody = `vid=${vid}&k=${encodeURIComponent(k)}`;

        const convertResponse = await fetch(convertUrl, {
            method: "POST",
            headers: {
                "accept": "",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: convertBody
        });

        const conversionResult = await convertResponse.json();
        const thumbnailUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
        return {
            creator: "@Samush$_",
            data: {
                title,
                size,
                vid,
                thumbnail: thumbnailUrl,
                dl_url: conversionResult.dlink
            }
        };
    } catch (error) {
        
    }
}*/

/*async function ytdls(videoUrl) {
    async function shortlink(url) {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return response.data;
    }
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
        headers: {
            "accept": "",
            "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://y2meta.mobi/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        method: "GET"
    });

    const oembedData = await oembedResponse.json();
    const downloadResponse = await fetch(`https://p.oceansaver.in/ajax/download.php?copyright=0&format=mp3&url=${encodeURIComponent(videoUrl)}&api=30de256ad09118bd6b60a13de631ae2cea6e5f9d`, {
        headers: {
            "accept": "",
            "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://y2meta.mobi/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        method: "GET"
    });

    const downloadData = await downloadResponse.json();
    const downloadId = downloadData.id;
    let progressData;
    do {
        const progressResponse = await fetch(`https://p.oceansaver.in/ajax/progress.php?id=${downloadId}`, {
            headers: {
                "accept": "",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            referrer: "https://y2meta.mobi/",
            referrerPolicy: "strict-origin-when-cross-origin",
            method: "GET"
        });
        progressData = await progressResponse.json();
    } while (progressData.progress < 1000);
    const tinyUrl = await shortlink(progressData.download_url);

    return {
        creator: "@Samush$_",
        data: {
            title: oembedData.title,
            author_name: oembedData.author_name,
            thumbnail: oembedData.thumbnail_url,
            author_url: oembedData.author_url,
            provider: oembedData.provider_url,
            dl_url: tinyUrl 
        }
    };
}*/

async function ytdlsa(videoUrl) {
    try {
        const response = await fetch("https://yt1s.ing/audio", {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundary6bigBzTDfo8rsAUR",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrftoken": "YtkPVWoUBsiXW5i1LYLtVgwUWDOCmmgDPUypyLlig5W9Q0M4PaSbD8WBTRoGfkEj",
                "cookie": "csrftoken=1BoKNZ7yPNOm45EdemhSS2AR7oKe38yQ",
                "Referer": "https://ytmp3.ing/",
                "Referrer-Policy": "same-origin"
            },
            body: `------WebKitFormBoundary6bigBzTDfo8rsAUR\r\nContent-Disposition: form-data; name="url"\r\n\r\n${videoUrl}\r\n------WebKitFormBoundary6bigBzTDfo8rsAUR--\r\n`
        });
        const audioData = await response.json();
        const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
            headers: {
                "accept": "*/*",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://y2meta.mobi/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            method: "GET"
        });

        const oembedData = await oembedResponse.json();
        async function shortlink(url) {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return response.data;
    }
    const tinyUrl = await shortlink(audioData.url);
        return {
            creator: "@Samush$_",
            data: {
                title: oembedData.title,
                author: oembedData.author_name,
                thumbnail: oembedData.thumbnail_url,
                dl_url: tinyUrl
            }
        }
} catch (error) {
}}

async function ytdlsv(videoUrl) {
    try {
        const response = await fetch("https://yt1s.ing/video", {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundary6bigBzTDfo8rsAUR",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrftoken": "YtkPVWoUBsiXW5i1LYLtVgwUWDOCmmgDPUypyLlig5W9Q0M4PaSbD8WBTRoGfkEj",
                "cookie": "csrftoken=1BoKNZ7yPNOm45EdemhSS2AR7oKe38yQ",
                "Referer": "https://ytmp3.ing/",
                "Referrer-Policy": "same-origin"
            },
            body: `------WebKitFormBoundary6bigBzTDfo8rsAUR\r\nContent-Disposition: form-data; name="url"\r\n\r\n${videoUrl}\r\n------WebKitFormBoundary6bigBzTDfo8rsAUR--\r\n`
        });
        const audioData = await response.json();
        const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
            headers: {
                "accept": "*/*",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://y2meta.mobi/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            method: "GET"
        });

        const oembedData = await oembedResponse.json();
        async function shortlink(url) {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return response.data;
    }
    const tinyUrl = await shortlink(audioData.url);
        return {
            creator: "@Samush$_",
            data: {
                title: oembedData.title,
                author: oembedData.author_name,
                thumbnail: oembedData.thumbnail_url,
                dl_url: tinyUrl
            }
        }
} catch (error) {
}}
/*async function ytdls(youtubeUrl) {
    try {
        const encodedUrl = encodeURIComponent(youtubeUrl);
        const response = await axios.get(`https://y2mp3.biz/backend1.php?id=${encodedUrl}`);
        const videoId = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/)[1];
        const highResThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const mediumResThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        const isHighResAvailable = await axios.head(highResThumbnail).then(response => response.status === 200).catch(() => false);
        const thumbnailUrl = isHighResAvailable ? highResThumbnail : mediumResThumbnail;
        const shortUrl = `https://youtu.be/${videoId}`;
        const data = {
            title: response.data.title,
            thumbnail: thumbnailUrl, 
            type: response.data.type,
            url: shortUrl,
            ytdl: response.data.download

        };
     return data;
    } catch (error) {
    }}*/

/*async function ytvs(url) {
  var ejec = (url) => (url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([a-zA-Z0-9_-]{11})/) || [])[1];
  var sizes = (bytes) => bytes >= 1073741824 ? (bytes / 1073741824).toFixed(2) + ' GB' : bytes >= 1048576 ? (bytes / 1048576).toFixed(2) + ' MB' : bytes >= 1024 ? (bytes / 1024).toFixed(2) + ' KB' : bytes + ' B';
  var timestamp = (seconds) => [
    Math.floor(seconds / 3600) > 0 ? String(Math.floor(seconds / 3600)).padStart(2, '0') : null,
    String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
    String(seconds % 60).padStart(2, '0')
  ].filter(Boolean).join(':')
  var videoId = ejec(url)
  var thumb_urls = {
    high: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }
  try {
    await Promise.all(Object.keys(thumb_urls).map(async (quality) => {
    var json = await fetch(thumb_urls[quality], { method: 'HEAD' })
   thumb_urls[quality] = json.ok ? thumb_urls[quality] : null
    }))
    var server = await fetch('https://flv-to.com/api/init', {
      method: 'POST',
      headers: {
        'cache-control': 'public, max-age=31536000, stale-if-error=60',
        'content-type': 'application/json; charset=utf-8',
        'Accept': 'application/json, text/plain, ',
        'User-Agent': 'Mozilla/5.0 (Linux; U; Android 12; es; moto g22 Build/STAS32.79-77-28-63-3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/110.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://flv-to.com/en13/download'
      },
      body: JSON.stringify({ videoId, serviceId: "yt", formatId: 8 })
    })
    var io = await server.json()
    return {
      creator: "@Samush$_",
      title: io.title,
      thumbnails: { high: thumb_urls.high, medium: thumb_urls.medium },
      duration: timestamp(io.duration),
      size: sizes(io.fileSize),
      dl_url: io.downloadLink
    }
  } catch (error) {
    return { error: '://' }
  }
}*/

async function igsdl(postUrl) {
  try {
    const url = "https://indownloader.app/request";
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
      Referer: "https://indownloader.app/video-downloader",
    };
    const data = new URLSearchParams({ link: postUrl, downloader: "video" });
    const response = await axios.post(url, data, { headers });
    const { html } = response.data;
    const $ = cheerio.load(html);
    const downloadLinks = $(".download-options a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link.includes("ey"));

    const results = downloadLinks.map((v, i) => {
      try {
        return {
          creator: "@Samush$_",
          url: JSON.parse(atob(v.split("id=")[1].split("&")[0]))?.url,
        };
      } catch (error) {
        console.error("Error decoding base64:", error);
        return { creator: "@Samush$_", url: v };
      }
    });
    return results.filter(
      (item, index, self) => index === self.findIndex((t) => t.url === item.url)
    );
  } catch (error) {
  }}

async function soundlist(url) {
  const body = JSON.stringify({
    url: url
  });
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
    "content-type": "application/json;charset=UTF-8",
    "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "Referer": "https://downloadsound.cloud/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  try {
    const response = await fetch("https://api.downloadsound.cloud/playlist", {
      method: "POST",
      headers: headers,
      body: body
    });
    const data = await response.json();
    return {
      creator: "@Samush$_",
      id: data.author.id,
      title: data.title,
      thumb: data.imageURL,
      owner: data.author.username,
      profile: data.author.avatar_url,
      published: data.author.created_at,
      description: data.author.description,
      verified: data.author.verified,
      followers: data.author.followers_count,
      url: data.url,
      tracks: data.tracks.map(track => ({
        title: track.title,
        author: track.author,
        image: track.imageURL,
        url: track.url,
      }))
    };
  } catch (error) {
   
  }
}



async function ytplayslist(playlistUrl) {
  const url = "https://youtubemultidownloader.org/process.php"; 

  const headers = {
    "accept": "*/*",
    "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": "trp_language=en_US",
    "Referer": "https://youtubemultidownloader.org/en/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  const body = `playlist_url=${encodeURIComponent(playlistUrl)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });


    const html = await response.text();
    const $ = cheerio.load(html);
    
    const videos = [];
    
    $('table.table-striped tbody tr').each((index, element) => {
      const num = $(element).find('td').eq(0).text().trim();
      const title = $(element).find('td').eq(2).text().trim(); 
      const downloadLink = $(element).find('td').eq(3).find('a').attr('href'); 
      const imageUrl = $(element).find('td').eq(1).find('img').attr('src'); 
      const youtubeLink = downloadLink ? downloadLink.split('url=')[1] : '';  
      videos.push({
        number: num,
        title: title,
        thumbnail: imageUrl,
        url: youtubeLink
      });
    });
    const creator = "@Samush$_";
    return {
      creator: creator,
      videos: videos
    };
  } catch (error) {
    return null;  
  }
}

async function actualizarStats(req) {
    stats.requests++;
    await fs.promises.writeFile(statsFilePath, JSON.stringify(stats, null, 4));
    await obtenerDatosUsuario(req);
    await ghpublish();
}

const port = 3777;
app.listen(port, () => {
  console.log('Servidor iniciado en el puerto', port);
});

const statsFilePath = path.join(__dirname, 'stats.json');

if (!fs.existsSync(statsFilePath)) {
    fs.writeFileSync(statsFilePath, JSON.stringify({ requests: 2987773 }));
}

let stats = JSON.parse(fs.readFileSync(statsFilePath));

async function obtenerDatosUsuario(req) {
  //  stats.requests++;
    let userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const userLang = req.headers["accept-language"] || "";
    const screenSize = req.headers["sec-ch-ua-platform"] || "";

    if (userIP === "::1" || userIP === "127.0.0.1") {
        userIP = "8.8.8.8"
    }

    try {
        const [location, cloudflareData] = await Promise.all([
            axios.get(`http://ip-api.com/json/${userIP}?fields=status,message,country,regionName,city,zip,lat,lon,isp,as,timezone,currency,query,mobile,proxy,hosting`),
            getCloudflareData()
        ]);

        const { country, regionName, city, zip, lat, lon, isp, as, timezone, currency, query, mobile, proxy, hosting } = location.data;

        const weatherResponse = await axios.get(`https://wttr.in/${lat},${lon}?format=j1`);
        const weatherData = weatherResponse.data.current_condition[0];

        const clima = {
            temperatura: `${weatherData.temp_C}°C`,
            humedad: `${weatherData.humidity}%`,
            condiciones: weatherData.weatherDesc[0].value
        };

        const userAgentData = parseUserAgent(userAgent);

        const datosUsuario = {
            ip: query || userIP,
            pais: country || "",
            region: regionName || "",
            ciudad: city || "",
            code_zip: zip || "",
            latitud: lat || "",
            longitud: lon || "",
            supplier: isp || "",
            organization: as || "",
            time_zone: timezone || "",
            currency: currency || "",
            operating_system: userAgentData.os,
            browser: userAgentData.browser,
            device: userAgentData.device,
            screen_resolution: screenSize,
            connection: mobile ? "Móvil" : "Fija",
            es_vpn_proxy: proxy || hosting ? "Sí" : "No",
            climate: clima,
            language: userLang,
            date: fetc(timezone),
            others_data: cloudflareData
        };

        if (!Array.isArray(stats.logs)) stats.logs = [];
        stats.logs.push(datosUsuario);

        fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 4));
      //  return { success: true, message: "", data: datosUsuario };
    } catch (error) {
    }}

async function getCloudflareData() {
    try {
        const response = await axios.get("https://speed.cloudflare.com/meta");
        return {
            Ip: response.data.clientIp || "",
            http: response.data.httpProtocol || "",
            asn: response.data.asn || "",
            organization: response.data.asOrganization || "",
            colo: response.data.colo || "",
            country: response.data.country || "",
            city: response.data.city || "",
            region: response.data.region || "",
            latitude: response.data.latitude || "",
            longitude: response.data.longitude || ""
        };
    } catch (error) {
        return { error: "No se pudo obtener datos de Cloudflare" };
    }
}

function parseUserAgent(ua) {
    const osRegex = /(Windows|Macintosh|Linux|Android|iOS|iPhone|iPad|Ubuntu)/i;
    const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)/i;
    const mobileRegex = /(Mobile|Android|iPhone|iPad)/i;

    const osMatch = ua.match(osRegex);
    const browserMatch = ua.match(browserRegex);
    const deviceMatch = ua.match(mobileRegex) ? "Móvil" : "PC/Tablet";
    return {
        os: osMatch ? osMatch[0] : "",
        browser: browserMatch ? browserMatch[0] : "",
        device: deviceMatch
    };
}

function fetc(timezone) {
    try {
        return new Intl.DateTimeFormat("es-ES", { timeZone: timezone, timeStyle: "full", dateStyle: "full" }).format(new Date());
    } catch {
        return "Fecha desconocida";
    }
}

app.get('/starlight/stats', (req, res) => {
    res.json({
        requests: stats.requests  
    });
});


async function obtenerAudio(text, voice) {
    var voices = {
    "Carlos": "7",  
    "Carmen": "1",
    "Jorge": "6",
    "Juan": "2",
    "Leonor": "9",
    "Francisca": "3",
    "Esperanza": "5",
    "Diego": "4"  
  };
  var voiceId = voices[voice];
  try {
    var sv = await fetch(`https://cache-a.oddcast.com/tts/genC.php?EID=2&LID=2&VID=${voiceId}&TXT=${text}&EXT=mp3&FNAME=&ACC=15679&SceneID=2701950&HTTP_ERR=`, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "audio",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://www.oddcast.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    });

    var buffer = await sv.buffer();
    var base64Audio = buffer.toString('base64');
    return base64Audio;
  } catch (error) {
    return null;
  }
}

async function shortenURLN9Cl(originalUrl) {
    const url = "https://n9.cl/es";
    const headers = {
        "accept": "*/*",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "if-modified-since": "Sat, 1 Jan 2000 00:00:00 GMT",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://n9.cl/es",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    const body = `xjxfun=create&xjxr=${Date.now()}&xjxargs[]=S%3C!%5BCDATA%5B${encodeURIComponent(originalUrl)}%5D%5D%3E&xjxargs[]=N1&xjxargs[]=S`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body
        });
        const resultText = await response.text();
        const match = resultText.match(/window\.location\s*=\s*"([^"]+)"/);
        return {
            creator: "@Samush$_",
            short: match ? match[1] : null
        };
    } catch (error) {
    
    }}

async function shortenURLShortenerMe(originalUrl) {
    const headers = {
        "accept": "*/*",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://url-shortener.me/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const body = `url=${encodeURIComponent(originalUrl)}`;

    try {
        const response = await fetch("https://url-shortener.me/Home/ShortURL", {
            method: "POST",
            headers,
            body
        });
        const result = await response.json();
        const createdDate = new Date(result.createdDate);
        const options = { timeZone: "America/Cancun", year: "numeric", month: "2-digit", day: "2-digit" };
        const localDate = createdDate.toLocaleDateString("es-MX", options);

        return {
            creator: "@Samush$_",
            views: result.view,
            created: localDate,
            short: result.shortedURL
        }
    } catch (error) {
        return null;
    }
}

async function ouo(url) {
    try {
        const response = await fetch(`http://ouo.io/api/KzDtJCvY?s=${url}`);
        const shortUrl = await response.text();
        
        return {
            creator: "@Samush$_",
            short: shortUrl
        };
    } catch (error) {
        return null;
    }
}

async function vurl(url) {
    try {
        const response = await fetch(`https://vurl.com/api.php?url=${encodeURIComponent(url)}`);
        const shortUrl = await response.text();

        return {
            creator: "@Samush$_",
            short: shortUrl.trim()
        };
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function UploadKitc(fileUrl) {
  function fakeUserAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }
  try {
    const fileResponse = await fetch(fileUrl, { headers: { "User-Agent": fakeUserAgent() } });
    const fileBuffer = await fileResponse.buffer();
    const formData = new FormData();
    formData.append("file", fileBuffer, { filename: "starlights" });

    const response = await fetch("https://ki.tc/file/u/", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": fakeUserAgent(),
      },
    });
    const result = await response.json();
    return {
      creator: "@Samush$_",
      url: result.file?.link,
    };
  } catch (error) {
   
  }
}

async function UploadTmpfiles(fileUrl) {
  function fakeUserAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }

  try {
    const fileResponse = await fetch(fileUrl, { headers: { "User-Agent": fakeUserAgent() } });
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const ext = fileUrl.split(".").pop().split("?")[0] || "bin";
    const formData = new FormData();
    formData.append("file", fileBuffer, { filename: `starlight.${ext}` });
    const response = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
      headers: { "User-Agent": fakeUserAgent() },
    });

    const result = await response.json();
    const originalURL = result?.data?.url;

    return {
      creator: "@Samush$_",
      url: originalURL ? `https://tmpfiles.org/dl/${originalURL.split("/").slice(-2).join("/")}` : null
    };
  } catch (error) {
    
  }
}


async function UploadUguu(fileUrl) {
  function fakeUserAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }

  try {
    const fileResponse = await fetch(fileUrl, { headers: { "User-Agent": fakeUserAgent() } });
    const fileBuffer = await fileResponse.buffer();
    const formData = new FormData();
    formData.append("files[]", fileBuffer, { filename: "starlights" });

    const response = await fetch("https://uguu.se/upload?output=json", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": fakeUserAgent(),
      },
    });

    const result = await response.json();
    return {
      creator: "@Samush$_",
      url: result.files[0]?.url,
    };
  } catch (error) {

  }
}

async function UploadPuticu(fileUrl) {
  function fakeUserAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }
  try {
    const fileResponse = await fetch(fileUrl, { headers: { "User-Agent": fakeUserAgent() } });

    const fileBuffer = await fileResponse.buffer();
    const response = await fetch("https://put.icu/upload/", {
      method: "PUT",
      body: fileBuffer,
      headers: {
        "User-Agent": fakeUserAgent(),
        Accept: "application/json",
      },
    });

    const result = await response.json();
    return {
      creator: "@Samush$_",
      url: result.direct_url,
    }
  } catch (error) {
  }}
  
  async function generateImage(captionInput) {
  const url = "https://artbit.ai/api/generateImage";
  const options = {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "Referer": "https://artbit.ai/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    body: JSON.stringify({
      captionInput: captionInput,
      captionModel: "sdxl",
      selectedRatio: "1024",
      selectedSamples: "1",
      negative_prompt: ""
    })
  }
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const imageUrl = data.imgs[0]; 
    return {
      creator: "@Samush",
      data: { image: imageUrl }
    };
  } catch (error) {
  }}
  
async function user_search(search) {
  try {
    var sv = await fetch(`https://www.instagram.com/api/v1/web/search/topsearch/?context=blended&include_reel=true&query=${search}&rank_token=0.4968593204932452&search_surface=web_top_search`, {
      method: 'GET',
      headers: { 
        "accept": "*/*",
        "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-full-version-list": "\"Not A(Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"132.0.6961.0\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-model": "\"moto g22\"",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-ch-ua-platform-version": "\"12.0.0\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-asbd-id": "359341",
        "x-csrftoken": "oe6rUCXHjY4Q0ISYwxsBM118maGsEOaD",
        "x-ig-app-id": "1217981644879628",
        "x-ig-www-claim": "hmac.AR2KEIGdg-TqI303z71RfZF14DoLGdd-wTUCVffFnHtsn1vj",
        "x-requested-with": "XMLHttpRequest",
        "x-web-session-id": "3mrdct:app18p:xh9t38",
        "cookie": "ig_did=84FFAF35-8E1E-4DBE-B6C6-44A769D144B8; datr=ezOdZ0hBjC9aGECWBWzlW_PT; ps_l=1; ps_n=1; ig_nrcb=1; ds_user_id=67898059497; mid=Z7U4mwABAAEJz1NXqTCcHYWr0wcB; dpr=1.3603438138961792; sessionid=67898059497%3Ad5POSDVgiQ6jHF%3A7%3AAYfw_Wo3orNUegCX4H6jfwb_QPxlxhyOv6Z4Q6ykWg; wd=529x656; rur=\"NCG\\05467898059497\\0541772350686:01f739546810f696ab25d74e55dcf72dfbb586d3ceb264411ccb0ee77dbe2bbf528d8dc8\"",
        "Referer": "https://www.instagram.com/explore/search/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    })
    var data = await sv.json()
    const usersArray = data.users.map(user => ({
      username: user.user.username,
      full_name: user.user.full_name,
      is_private: user.user.is_private,
      profile: user.user.profile_pic_url,
      verified: user.user.is_verified,
      url: "https://instagram.com/" + user.user.username
    }))
    return {
      creator: "@Samush$_",
      data: usersArray
    }
  } catch (error) {
  }}
  
  async function x_search(txt) {
  const url = "https://x.com/i/api/graphql/U3QTLwGF8sZCHDuWIMSAmg/SearchTimeline";

  const variables = {
    rawQuery: `${txt}`,
    count: 50,
    querySource: "typed_query",
    product: "Top"
  }

  const features = {
    profile_label_improvements_pcf_label_in_post_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: true,
    responsive_web_jetfuel_frame: false,
    responsive_web_grok_share_attachment_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_grok_analysis_button_from_backend: false,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_enhance_cards_enabled: false
  };

  const params = new URLSearchParams({
    variables: JSON.stringify(variables),
    features: JSON.stringify(features)
  });

  const options = {
    method: 'GET',
    headers: {
      'accept': '*/*',
      'accept-language': 'es-US,es-419;q=0.9,es;q=0.8',
      'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-client-transaction-id': 'vXH+6uHu8i3ZYtbBDgTCdZFHWEaqCo6xqjcIwpJ0L0Rqcu3q+IHY/hLr2hAEyq/aAM4IyL7ckrO/HTGIjd9qNsGeiVt9vg',
      'x-client-uuid': 'e0f0e1be-d958-4837-991b-f8751e73c7e9',
      'x-csrf-token': 'c49dfbddf8dbe47bbc8a08fff9e6948ae6b2391fff3bc124434d1465343aaa391c2b5b645bcd076d4f17b3cec7e3e0c959218401cfa3ffc5486b23676fba98927abb543e0d30b1462233ccf8536698bc',
      'x-twitter-active-user': 'yes',
      'x-twitter-auth-type': 'OAuth2Session',
      'x-twitter-client-language': 'es',
      'cookie': 'guest_id_marketing=v1%3A174097011507491500; guest_id_ads=v1%3A174097011507491500; guest_id=v1%3A174097011507491500; gt=1896392228093775935; external_referer=padhuUp37ziB1mb6tX%2Bb05GcyPv53d7c|0|8e8t2xd8A2w%3D; g_state={"i_l":0}; kdt=c5gna9HxC5HdslDWFjoNqouHTHpIloSR3mv0WMze; auth_token=ff8047ece836072d4b0425f07f9520de3f8f2b66; ct0=c49dfbddf8dbe47bbc8a08fff9e6948ae6b2391fff3bc124434d1465343aaa391c2b5b645bcd076d4f17b3cec7e3e0c959218401cfa3ffc5486b23676fba98927abb543e0d30b1462233ccf8536698bc; twid=u%3D1688014800490487808; att=1-W8MDSzn5XXWSL8CFMzMmBecBjVm79qEURuyVlqYn; personalization_id="v1_VeAZATDEB2lgnCFPTF5adg=="; lang=es',
      'Referer': 'https://x.com/search?q=hentai%20videos%20&src=typed_query',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  };

  try {
    const response = await fetch(`${url}?${params.toString()}`, options);
    const data = await response.json();
    const allEntries = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions
      ?.flatMap(instruction => instruction.entries) || [];
    const result = {
  creator: "@Samush$_",
  data: allEntries.map(entry => {
    const tweet = entry?.content?.itemContent?.tweet_results?.result;
    const user = tweet?.core?.user_results?.result;
    if (!tweet || !user) return null; // Si falta información clave, ignorar este tweet.

    const urlsArray = tweet?.legacy?.entities?.media?.map(m => m.expanded_url) || [];
    const urls = [...new Set(urlsArray)];
    const singleUrl = urls.length > 0 ? urls[0] : "";

    const tweetData = {
      user_id: user?.rest_id,
      user_name: user?.legacy?.name,
      verified: user?.is_blue_verified,
      user_desc: user?.legacy?.description,
      screen_name: user?.legacy?.screen_name,
      profile: user?.legacy?.profile_image_url_https,
      banner: user?.legacy?.profile_banner_url,
      followers: user?.legacy?.followers_count,
      following: user?.legacy?.friends_count,
      caption: tweet?.legacy?.full_text.replace(/https:\/\/t\.co\/\S+/g, ''),
      views: tweet?.views?.count,
      likes: tweet?.legacy?.favorite_count,
      shares: tweet?.legacy?.retweet_count,
      comments: tweet?.legacy?.reply_count
    };

    if (singleUrl) {
      tweetData.url = singleUrl;
    }
    return Object.values(tweetData).some(value => value !== undefined && value !== null) ? tweetData : null;
  }).filter(item => item !== null) 
};

return result;
  } catch (error) {
  }
}
  
  
async function textoimage2(prompt) {
    const url = `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${prompt}&aspect_ratio=Select%20Aspect%20Ratio&link=writecream.com`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
            return { creator: "@Samush$_", data: { image: data.image_link } };
    } catch (error) {
    }}
    
    async function xdls(link) {
    try {
        var url = 'https://savetwitter.net/api/ajaxSearch'
        var data = qs.stringify({
            q: link,
            lang: 'es'
        })
        var config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Access-Control-Allow-Origin': 'https'
            }
        }
        var response = await axios.post(url, data, config)
        var html = response.data.data
        var $ = cheerio.load(html)
        var isImage = $('.photo-list').length > 0
        var isVideo = $('.dl-action p a').length > 0
        if (isImage) {
            var images = []
            $('.photo-list ul.download-box li .download-items__thumb img').each((i, el) => {
                var urls = $(el).attr('src')
                images.push(urls)
            })
            return {
                creator: '@Samush$_',
                data: {
                    images
                }
            }
        } else if (isVideo) {
            var thumbnail = $('.image-tw img').attr('src')
            var video = $('.dl-action p a').first().attr('href')
            var title = $('.content h3').text()
            var duration = $('.content p').text()
            return {
                creator: '@Samush$_',
                data: {
                    title,
                    duration,
                    thumbnail,
                    video
                }
            }
        }
    } catch (error) {
    }
}

async function igdlss(url) {
    try {
        const response = await fetch("https://www.fastdl.live/api/search", {
            method: "POST",
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referer": "https://www.fastdl.live/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (data.success && Array.isArray(data.result)) {
            return {
                creator: "@Samush$_",
                data: data.result.map(item => ({
                    type: item.type,
                    dl_url: item.downloadLink
                }))
            };
        }
    } catch (error) {
    }
}


async function snap_search(text) {
    const url = `https://www.snapchat.com/explore/${text}`

    const headers = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "Referer": "https://www.snapchat.com/explore/Le-sserafim",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    try {
      const response = await fetch(url, { method: "GET", headers: headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $(".SpotlightResult_spotlightCard__ZNwnu").each((index, element) => {
      const videoLink = $(element).find(".SpotlightResult_thumbnail__XFNCz").attr("href");
      const imageLink = $(element).find(".ImageTile_tileMedia__5vXqC").attr("src");
      const description = $(element).find(".SpotlightResult_description__5B4T_").text().trim();
      
      if (videoLink || imageLink || description) {
        results.push({
          caption: description || "",
          thumbnail: imageLink || "",
          url: videoLink ? `${videoLink}` : ""
        });
      }
    });

      return {
        creator: "@Samush$_",
        data: results
      };

    } catch (error) {
      return {
        creator: "@Samush$_",
        data: []
      }
    }
  }
  
  async function DescribePicture(imageUrl, lang = "en") {
  try {
    async function translateText(text, lang) {
      try {
        let reis = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
        let res = await reis.json();
        return res[0]?.map(t => t[0]).join("") || text;
      } catch {
        return text;
      }
    }
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();
    const base64Image = buffer.toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg"; 
    const url = "https://describe.pictures/api/task/describe/description";
    const headers = {
      "accept": "*/*",
      "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "Referer": "https://describe.pictures/es",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const body = JSON.stringify({
      image: `data:${mimeType};base64,${base64Image}`,
      prompt: "describe"
    });
    const response = await fetch(url, { method: "POST", headers, body });
    const result = await response.json();
    let content = result?.data?.content || "";
    if (lang !== "en") {
      content = await translateText(content, lang);
    }
    return {
      creator: "@Samush$_",
      data: { desc: content }
    };
  } catch (error) {
  }}
  
  async function colorizeZai(img, ext = "jpg") {
  try {
    const fakeUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    const response = await fetch(img);
    const imageBuffer = await response.buffer();
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'application/octet-stream'
    });
    form.append('renderFactor', '12');
    form.append('requestId', 'random-request-id');
    const apiResponse = await fetch('https://api.hotpot.ai/colorize-picture', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'authorization': 'hotpot-t2mJbCr8292aQzp8CnEPaK',
        'User-Agent': fakeUserAgent,
        ...form.getHeaders()
      },
      body: form
    });
    const processedImageBuffer = await apiResponse.buffer();
    const formData = new FormData();
    formData.append("file", processedImageBuffer, { filename: `cfs.${ext}` });

    const uploadResponse = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
      headers: { "User-Agent": fakeUserAgent },
    });

    const uploadResult = await uploadResponse.json();
    const originalURL = uploadResult?.data?.url;
    const uploadedURL = originalURL ? `https://tmpfiles.org/dl/${originalURL.split("/").slice(-2).join("/")}` : "";
    return { creator: "@Samush$_", url: uploadedURL };
  } catch (error) {
  }}
  
app.get('/starlight/colorize-ai', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' })
    }
    try {
        const result = await colorizeZai(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get('/starlight/describe-picture', async (req, res) => {
    actualizarStats(req);
    let url = req.query.url;
    const lang = req.query.lang || "es";
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parametro url" }, null, 2));
    }
    try {
        const result = await DescribePicture(url, lang);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});  

app.get('/starlight/instagram-dl', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' })
    }
    try {
        const result = await igdlss(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});


app.get('/starlight/twitter-dl', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await xdls(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});
    

app.get('/starlight/tweets-search', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parametro text" }, null, 2));
    }

    try {
        let result = await x_search(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});  
    
app.get('/starlight/Instagram-users', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parametro text" }, null, 2));
    }

    try {
        let result = await user_search(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});  

    
app.get('/starlight/txt-to-image2', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parametro text" }, null, 2));
    }

    try {
        let result = await textoimage2(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});  

      
app.get('/starlight/txt-to-image', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parametro text" }, null, 2));
    }

    try {
        let result = await generateImage(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});  


app.get('/starlight/uploader-put', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await UploadPuticu(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/uploader-tmp', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await UploadTmpfiles(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});
app.get('/starlight/uploader-uguu', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await UploadUguu(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});


app.get('/starlight/uploader-kitc', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await UploadKitc(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/uploader-ee', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await UploadEE(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/shorten-vurl', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await vurl(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/shorten-ouo', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await ouo(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/shortenerme', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await shortenURLShortenerMe(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});

app.get('/starlight/shorten-n9cl', async (req, res) => {
  actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }
  try {
    const result = await shortenURLN9Cl(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});
/*app.get('/starlight/loquendo', async (req, res) => {
actualizarStats(req);
  await obtenerDatosUsuario();
  await gh();
  const { text, voice } = req.query;
  if (!text) {
    const models = [
      "Carlos",
      "Carmen",
      "Jorge",
      "Juan",
      "Leonor",
      "Francisca",
      "Esperanza",
      "Diego"
    ]; 
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).send(JSON.stringify({ message: "falta el parametro text", models }, null, 4));
  }
  try {
    const base64Audio = await obtenerAudio(text, voice);
    const responseData = {
      creator: "@Samush$_",
      audio: base64Audio
    }
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(responseData, null, 4));
  } catch (error) {
    const errorResponse = {
      error: "://"
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).send(JSON.stringify(errorResponse, null, 4));  
  }
});*/

app.get('/starlight/shazam', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).send(JSON.stringify({ msg: "falta el parametro url" }, null, 4));
    }

    try {
        const songData = await shazamv2(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(JSON.stringify(songData, null, 4));
    } catch (error) {
       /* res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).send(JSON.stringify({ message: "://" }, null, 4));*/
    }
});

app.get('/starlight/loquendo', async (req, res) => {
    try {
        actualizarStats(req);
        const { text, voice } = req.query;
        if (!text) {
            const models = ["Carlos", "Carmen", "Jorge", "Juan", "Leonor", "Francisca", "Esperanza", "Diego"];
            return res.status(400).json({ message: "Falta el parámetro text", models });
        }
        const base64Audio = await obtenerAudio(text, voice);
        res.status(200).json({ creator: "@Samush$_", audio: base64Audio });

    } catch (error) {
        res.status(500).json({ error: "://" });
    }
});


app.get('/starlight/youtube-playlist', async (req, res) => {
actualizarStats(req);
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'falta parametro url' });
  }

  try {
    const result = await ytplayslist(url);  
    if (result) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(JSON.stringify(result, null, 4));  
    } else {
      res.status(500).send(JSON.stringify({ error: '://' }, null, 4));
    }
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).send(JSON.stringify({ error: '://' }, null, 4));
  }
});
app.get('/starlight/soundcloud-playlist', async (req, res) => {
actualizarStats(req);  
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "falta el parametro url" });
  }

  try {
    const result = await soundlist(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});


app.get('/starlight/ig-posts', async (req, res) => {
actualizarStats(req);  
  const text = req.query.text 
  if (!text) {
    return res.status(400).send({ error: "falta parametro text" });
  }

  const cleanupDesc = (string) => string.split("#")[0]?.trim("\n");

  const axiosInstance = axios.create({
    baseURL: "https://i.instagram.com",
    headers: {
      "x-ig-app-id": "936619743392459",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Accept: "/",
    },
  });

  try {
    const scrapeUser = async (username) => {
      try {
        const response = await axiosInstance.get(
          `/api/v1/users/web_profile_info/?username=${username}`
        );
        return response.data.data.user;
      } catch (error) {
        throw error;
      }
    };

    const getPostByUsername = async (username) => {
      try {
        const rawPosts = (await scrapeUser(username)).edge_owner_to_timeline_media
          .edges;
        return rawPosts.map(({ node: r }) => {
          const d = r.edge_media_to_caption.edges;
          const hasNoDesc = d.length === 0;
          const outpic = r.display_url;
          const outcap = hasNoDesc ? "" : cleanupDesc(d[0]?.node.text);
          const outcode = r.shortcode;

          return {
            creator: "@Samuh$_",
            description: outcap,
            published: r.taken_at_timestamp,
            img: outpic
          };
        });
      } catch (error) {
        throw error;
      }
    };

    const posts = await getPostByUsername(text);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(posts, null, 4)); 
  } catch (error) {
    res.status(500).send({ error: "://" });
  }
});

app.get('/starlight/ig-story', async (req, res) => {
actualizarStats(req);  
  const user = req.query.user;
  if (!user) {
    res.status(400).json({ error: 'falta parametro user' });
    return;
  }
  try {
    const result = await Igstorys(user);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: '://' });
  }
});


app.get('/starlight/apple-music', async (req, res) => {
actualizarStats(req);  
  const url = req.query.url

  if (!url) {
    return res.status(400).json({ error: 'falta parametro url' });
  }

  try {
    const data = await AppleDL(url);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).send(JSON.stringify({ error: '://' }, null, 4));
  }
});

app.get('/starlight/vimeo-DL', async (req, res) => {
actualizarStats(req);
    const url = req.query.url
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' }); 
    }
    try {
        const result = await VimeoDL(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4)); 
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get('/starlight/capcut-DL', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' });
    }
    try {
        const result = await CapCutDl(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4))
    } catch (error) {
        res.status(500).json({ error: '://' })
    }
})

app.get('/starlight/spotify-albums-list', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'falta el parametro url' }); 
    }
    try {
        const details = await getSpotifyDetails(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(details, null, 4)); 
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get('/starlight/threads-DL', async (req, res) => {
    actualizarStats(req); 
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' }); 
    }
    try {
        const result = await threadsDL(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});


app.get('/starlight/Tiktok-voices', async (req, res) => {
    actualizarStats(req);
    const text = req.query.text || null;
    const voice = req.query.voice || null;
    if (!text && !voice) {
        const result = {
            Creator: "@Samush$_",
            modelos_disponibles: modelos
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(JSON.stringify(result, null, 4));
    }
    var selectedVoice = voice || 'en_us_001'; 
    var audioBuffer = await TikTokVoice(text || 'Holaaa', selectedVoice);
    if (audioBuffer) {
        const result = {
            Creator: "@Samush$_",
            audio: audioBuffer.toString('base64'),
            mas_modelos: modelos
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(JSON.stringify(result, null, 4));
    } else {
        res.status(500).send('://');
    }
});

app.get('/starlight/pornhubdl', async (req, res) => {
    actualizarStats(req);
  var url = req.query.url
  if (!url) {
    return res.status(400).json({ error: 'falta parametro url' })
  }
  try {
    const result = await saveporn(url)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(500).send(JSON.stringify({ error: '://' }, null, 4))
  }
})

/*app.get('/starlight/playstore-DL', async (req, res) => {
    var url = req.query.url;
    if (!url) return res.status(400).json({ error: 'falta parametro url' })
    try {
        var result = await playstoreDL(url)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        return res.status(200).send(JSON.stringify(result, null, 4))
    } catch (error) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        return res.status(500).send(JSON.stringify({ error: "://" }, null, 4))
    }
})*/

app.get('/starlight/tiktok-images', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;

    try {
        const result = await ttsv(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).send(JSON.stringify({ error: '://' }, null, 4));
    }
});

app.get('/starlight/snapchat-DL', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url; 
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' });
    }
    try {
        const result = await snapdl(url); 
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4)); 
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get("/starlight/tiktok-user-posts", async (req, res) => {
    actualizarStats(req);
  try {
    const user = req.query.user;
    const result = await tikUser(user);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).send({ message: "://" });
  }
});


app.get('/starlight/detect-faces', async (req, res) => {
    actualizarStats(req);
  const url = req.query.url
  if (!url) {
    return res.status(400).json({
      error: 'falta parametro url'
    })
  }

  try {
    const result = await analistics(url)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    res.status(500).json({
      error: '://'
    })
  }
})

app.get('/starlight/face-years', async (req, res) => {
    actualizarStats(req);
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'falta parametro url' });
    }
    const result = await scrapeAgeGuess(url); 
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: '://' });
  }
});

app.get('/starlight/face-similar', async (req, res) => {
    actualizarStats(req);
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      error: 'falta parametro url'
    })
  }

  try {
    const result = await facecelyb(url)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    res.status(500).json({
      error: '://'
    })
  }
})

app.get('/starlight/spotifydl', async (req, res) => {
    actualizarStats(req);
  try {
    let url = req.query.url;
    if (!url) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Falta parametro url' }, null, 2));
      return;
    }
    
    const result = await SpotifyTracks(url);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result, null, 2));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: '://' }, null, 2));
  }
});

app.get('/starlight/youtube-search', async (req, res) => {
    actualizarStats(req);
  let text = req.query.text;

  if (!text) {
    return res.status(400).json({ error: 'falta parametro text' });
  }
  try {
    const result = await searchYouTube(text);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: "://" });
  }
});


app.get('/starlight/youtube-mp3', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'falta el parametro url' });
    }

    try {
        const result = await ytdlsa(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});


app.get('/starlight/youtube-mp4', async (req, res) => {
    const url = req.query.url;
    const desiredQuality = req.query.q || ""; 
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' });
    }
    try {
        const result = await ytdlsv(url, desiredQuality);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get('/starlight/Ifunny-dl', async (req, res) => {
    actualizarStats(req);
    const text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro text' }, null, 2));
    }
    try {
        const data = await downloadIfunnyMedia(text);
        data.creator = '@Samush_$';
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get('/starlight/chazam', async (req, res) => {
    actualizarStats(req); 
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'falta parametro url' });
  }

  try {
    const result = await recognizeSong(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '://' });
  }
});

app.get('/starlight/tiktok-trends', async (req, res) => {
 actualizarStats(req);
let region = req.query.region || '';
try {
if (!region) {
return res.status(400).json({ error: 'falta parametro region' })
    }
    const result = await getTrendingVideos(region);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    res.status(500).json({ error: '://' });
  }
});


app.get('/starlight/terabox-dl', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parámetro url' }, null, 2));
    }
    try {
        const data = await fetchTeraboxLink(url);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://', message: error.message }, null, 2));
    }
});


const fetchProfile = async (username) => {
  const formattedUsername = username.toLowerCase().startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`;
  const url = `https://dumpoir.com/v/${formattedUsername.slice(1)}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const profile = {
      creator: 'samu',
      username: $('h1.text-4xl').text().trim(),
      name: $('h2.text-2xl').text().trim(),
      profile: $('figure img').attr('src'),
      bio: $('div.text-sm').text().trim(),
      posts: $('div.stat:contains("Posts") .stat-value').text().trim(),
      followers: $('div.stat:contains("Followers") .stat-value').text().trim(),
      following: $('div.stat:contains("Following") .stat-value').text().trim()
    };


    return profile;
  } catch (error) {
    if (formattedUsername.startsWith('@')) {
      return fetchProfile(formattedUsername.slice(1));
    } else {
      
    }
  }
};

app.get('/starlight/shazamtube', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url
    if (!url) {
        return res.status(400).send({ error: 'Falta el parametro url' })
    }
    const result = await ShazamTube(url)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
})


app.get('/starlight/ig-stalk', async (req, res) => {
    actualizarStats(req);
let { text } = req.query.text
if (!text) return res.status(400).json({ error: 'falta parametro text' });
try {
let profile = await fetchProfile(text)
res.json(profile);
} catch (error) {
res.status(500).json({ error: '://' });
}});

app.get('/starlight/ytmp3', async (req, res) => {
    actualizarStats(req);
  let url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'falta parametro url' });
  }
  const result = await dlmp3(videoUrl);
  if (result && result.url) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(JSON.stringify(result, null, 4));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: '://' });
  }
})

app.get('/starlight/genius-lyrics', async (req, res) => {
    actualizarStats(req);
    const text = req.query.text
    if (!text) {
        return res.status(400).json({ error: 'Falta parametro text' });
    }
    let lyrics = await getLyrics(text)
    if (lyrics) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).send(JSON.stringify(lyrics, null, 4))
    } else {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(500).send(JSON.stringify({ error: '://' }, null, 4))
    }
})
app.get('/starlight/hentaicity', async (req, res) => {
    actualizarStats(req); 
  const url = req.query.url
  try {
    if (!url) {
      return res.status(400).json({ error: 'falta parametro url' })
    }
    const result = await getSchemaData(url)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    res.status(500).json({ error: '://' })
  }
})

app.get('/starlight/zedge-walls-search', async (req, res) => {
    actualizarStats(req); 
    const text = req.query.text
    if (!text) {
        return res.status(400).json({ error: 'falta parametro text' });
    }
    try {
        const wallpapers = await mapZedgeWallpapers(text);
        res.json(wallpapers);
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});

app.get('/starlight/zedge-rings-search', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        return res.status(400).json({ error: 'falta el parametro text' })
    }
    try {
        const results = await mapZedgeResults(text)
        res.json(results)
    } catch (error) {
        res.status(500).json({ error: '://' })
    }
})


app.get('/starlight/youtube-music-search', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro text' }, null, 2));
    }
    try {
        let results = await MyMusicSearch(text);
        res.setHeader('Content-Type', 'application/json');

        const infos = await Promise.all(results.map(async (music) => {
            const videoId = extractVideoId(music.link);
            let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            let thumbnailAvailable = false;

            try {
                const thumbResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
                if (thumbResponse.status === 200) {
                    thumbnailAvailable = true;
                }
            } catch (error) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }

            return {
                creator: '@Samush_$',
                title: music.title,
                artists: music.artists,
                duration: music.duration,
                album: music.album,
                thumbnail: thumbnailAvailable ? thumbnailUrl : null,
                id: music.id,
                link: music.link
            };
        }));

        res.end(JSON.stringify(infos, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get('/starlight/blackbox', async (req, res) => {
    actualizarStats(req); 
    const system = req.query.system;
    const text = req.query.text;

    if (!system || !text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'Falta de parámetros' }, null, 2));
    }

    try {
        if (system) {
            USER_SYSTEM_PROMPT = system + ' ';
        }
        const blackbox = new Blackbox();
        const input = [{ role: 'user', content: text }];
        const data = await blackbox.chat(input, USER_SYSTEM_PROMPT);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ creator: '@Samush_$', results: data }, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});


app.get('/starlight/zedge-dl', async (req, res) => {
    actualizarStats(req);
    let url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro url' }, null, 2));
    }

    try {
        let content = await fetchZedgeContentDetails(url);
        res.setHeader('Content-Type', 'application/json');
        if (content) {
            res.end(JSON.stringify(content, null, 2));
        } else {
            res.end(JSON.stringify(content, null, 2));
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});


app.get('/starlight/pinterest-search', async (req, res) => {
    actualizarStats(req);
    const text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta el parámetro text' }, null, 2));
    }
    
    async function searchPinterest(query) {
        const baseUrl = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
        const queryParams = {
            source_url: `/search/pins/?q=${query}`,
            data: JSON.stringify({
                options: {
                    isPrefetch: false,
                    query,
                    scope: 'pins',
                    no_fetch_context_on_resource: false
                },
                context: {}
            }),
            _: Date.now()
        };
        
        const url = new URL(baseUrl);
        Object.entries(queryParams).forEach(entry => url.searchParams.set(entry[0], entry[1]));
        
        try {
            const response = await axios.get(url.toString());
            const json = response.data;
            const results = json.resource_response?.data?.results ?? [];
            
            const mappedResults = results.map(item => ({
                title: item.grid_title ?? '',
                id: item.id ?? '',
                publish: (new Date(item.created_at)).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) ?? '',
                image: item.images?.['736x']?.url ?? '',
                pin: `https://www.pinterest.com/pin/${item.id}` ?? ''
            }));
            
            return mappedResults;
        } catch (error) {
            return [];
        }
    }
    
    try {
        const searchResults = await searchPinterest(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ creator: '@Samush_$', results: searchResults }, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get('/starlight/turbo-ai', async (req, res) => {
     stats.requests++;
     fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 4));
     obtenerDatosUsuario(req);
     ghpublish();
    const content = req.query.content;
    const text = req.query.text;
    
    if (!content || !text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta los parámetros' }, null, 2));
    }

    try {
        const result = await gptWordle(content, text);
        if (result && result.message && result.message.content) {
            delete result.limit;
            delete result.fullLimit;
            delete result.message.id;
            delete result.message.created;
            delete result.message.role;
            delete result.message.status;
            const response = {
                creator: '@Samush_$',
                content: result.message.content
            };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response, null, 2));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});


app.get('/starlight/tiktoksearch', async (req, res) => {
    actualizarStats(req);
    let text = req.query.text;
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: true, message: "falta el parámetro text" }, null, 2));
    }

    try {
        let result = await tikSearch(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});


app.get('/starlight/like-downloader', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro url' }, null, 2));
    }

    try {
        const params = new URLSearchParams();
        params.append('id', url);
        params.append('locale', 'en');
        const response = await axios.post('https://likeedownloader.com/process', params);
        const json = response.data;
        const urls = [];
        const $ = cheerio.load(json.template);
        $('a').each((i, e) => urls.push($(e).attr('href')));
        const data = {
            watermark: urls[0].replace(/'/g, ''),  
            'no watermark': urls[1].replace(/'/g, ''),
        };
        const result = {
            creator: '@Samush_$',
            caption: $('p.infotext').text().replace(/\r?\n|\r/g, '').trim(),
            links: data,
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get('/starlight/transcribir-youtube', async (req, res) => {
    actualizarStats(req);
    let url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'Falta el parametro url' }, null, 2));
    }

    try {
        let transcribe = await youtubeTranscript(url);
        const result = {
            creator: '@Samush_$',
            result: transcribe
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get("/starlight/gemini", async (req, res) => {
    actualizarStats(req);
  try {
    const { default: Gemini } = await import("gemini-ai")
    const gemini = new Gemini("AIzaSyAHWF177Syns4TY3DLL9Z_0RNRYPpd5NBs")
    const chat = gemini.createChat()
    const text = req.query.text
    if (!text) {
      const err = {
        message: "falta el parametro text",
      }
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Access-Control-Allow-Origin", "*")
      return res.status(400).send(JSON.stringify(err, null, 4))
    }
    const respuesta = await chat.ask(text)
    const result = {
      status: "true",
      creator: "Samush",
      result: respuesta,
    }
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    const err = {
      status: "false",
      message: "://",
    }
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(500).send(JSON.stringify(err, null, 4))
  }
})

app.get('/starlight/tweeter-stalk', async (req, res) => {
    actualizarStats(req);
  let text = req.query.text;
  if (!text) {
    const errorResponse = {
      error: 'falta parámetro text'
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).end(JSON.stringify(errorResponse, null, 2));
  }

  try {
    const url = `https://twstalker.com/search/${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    let firstUser = null;

    $('.following-posts').first().each((index, element) => {
      const username = $(element).find('.main-following-dts1 a').attr('href').substring(1);
      const profilePic = $(element).find('.main-following-dts1 img').attr('src');
      const fullName = $(element).find('.main-following-dts1 .following-text3 h4').text().trim();
      const bio = $(element).find('.main-following-dts1 .following-text3 span').last().text().trim();
      const followersFollowing = $(element).find('.main-following-dts1 .following-text3 span').first().text().trim();
      const loadMoreLink = 'https://x.com/' + $(element).find('.main-following-dts1 a').attr('href').substring(1);

      firstUser = {
        creator: '@Samush_$',
        user: username,
        profile: profilePic,
        names: fullName,
        bio: bio,
        link: loadMoreLink
      };
 
      return false;
    });

    if (firstUser) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).end(JSON.stringify(firstUser, null, 2));
    } else {
      const notFoundResponse = {
        error: '://'
      };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(404).end(JSON.stringify(notFoundResponse, null, 2));
    }
  } catch (error) {
    const errorResponse = {
      error: '://'
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).end(JSON.stringify(errorResponse, null, 2));
  }
});



app.get('/starlight/tiktok2', async (req, res) => {
    actualizarStats(req); 
  const { url } = req.query;
  let tiktokUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
  try {
    let response = await axios.get(tiktokUrl);
    let video = response.data.video?.noWatermark || response.data.video?.watermark;
    let title = response.data.title || "";
    let likes = response.data.stats?.likeCount || "";
    let comment = response.data.stats?.commentCount || "";
    let shares = response.data.stats?.shareCount || "";
    let views = response.data.stats?.playCount || "";
    let creator = response.data.author?.name || "";
    let desc = response.data.author?.signature || "";
    let id = response.data.author?.id || "";
    let avatar = "";

    try {
      let avatarResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${response.data.author?.avatar}`);
      avatar = avatarResponse.data || avatar;
    } catch (error) {
      console.error(error);
    }

    const data = {
      title,
      likes,
      comment,
      shares,
      views,
      creator,
      desc,
      id,
      avatar,
      video
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '://' });
  }
})

app.get('/starlight/soundcloud-search', async (req, res) => {
    actualizarStats(req);
  let text = req.query.text;
  if (!text) {
    return res.status(400).json({ error: 'falta parámetro text' });
  }

  const soundcloudURL = 'https://m.soundcloud.com';
  try {
    const response = await axios.get(`${soundcloudURL}/search?q=${encodeURIComponent(text)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/55.0 BrandVerity/1.0 (http://www.brandverity.com/why-is-brandverity-visiting-me) PostRank/2.0 (postrank.com; 1 subscribers)',
      },
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $('div > ul > li > div').each((index, element) => {
      const $element = $(element);
      const title = $element.find('a').attr('aria-label').trim();
      const image = $element.find('img').attr('src').trim();
      const artist = $element.find('.Information_CellSubtitle__1mXGx').text().trim();
      const repro = $element.find('.Metadata_CellLabeledMetadata__3s6Tb').eq(0).find('.Metadata_MetadataLabel__3GU8Y').text().trim();
      const duration = $element.find('.Metadata_CellLabeledMetadata__3s6Tb').eq(1).find('.Metadata_MetadataLabel__3GU8Y').text().trim();
      const url = soundcloudURL + $element.find('a').attr('href').trim();
      
      if (!repro.includes('Followers')) {
        results.push({
          creator: 'Samu', 
          title,
          image,
          artist,
          repro,
          duration,
          url,
        });
      }
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(results, null, 2));
    
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
  }
});

        
app.get('/starlight/chochox', async (req, res) => {
    actualizarStats(req); 
    const url = req.query.url;

    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).end(JSON.stringify({ error: "falta parametro url" }, null, 2));
        return;
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('.titl').text();
        const category = $('#breadcrumbs').find('a').eq(-2).text();
        const description = $('meta[property="og:description"]').attr('content');
        const link = $('meta[property="og:url"]').attr('content');
        const site = $('meta[property="og:site_name"]').attr('content');
        const published = moment($('meta[property="article:published_time"]').attr('content')).locale('es').format('LL');
        const modified = moment($('meta[property="article:modified_time"]').attr('content')).locale('es').format('LL');
        const images = [];

        $('figure.wp-block-image img').each((index, element) => {
            const src = $(element).attr('src');
            images.push(src);
        });

        const data = {
            creator: "@Samush_$",
            title,
            category,
            site,
            description,
            published,
            url: link,
            images
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data, null, 2));

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});


app.get('/starlight/facebook', async (req, res) => {
  try {
    actualizarStats(req);
    const url = req.query.url
    if (!url) {
      return res.status(400).json({ error: 'falta parametro url' });
    }
    const result = await fbdls(url);
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(JSON.stringify(result, null, 4))
  } catch (error) {
    res.status(500).json({ error: '://' })
  }
})

app.get('/starlight/Twitter-Posts', async (req, res) => {
    actualizarStats(req);
  try {
    const text = req.query.text;
    if (!text) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).end(JSON.stringify({ error: 'falta el parametro text' }, null, 2));
    }

    const url = `https://twstalker.com/search/${encodeURIComponent(text)}`;
    const response = await axios.get(url);

    function extractTweets(html) {
      const $ = cheerio.load(html);
      const tweets = [];

      $('.activity-posts').each((index, element) => {
        const user = $(element).find('.main-user-dts1 a').attr('href').substring(1);
        const profilePic = $(element).find('.main-user-dts1 img').attr('src');
        const tweetContent = $(element).find('.activity-descp p').text().trim();
        const tweetLink = 'https://x.com' + $(element).find('.user-text3 a').attr('href');
        const timestamp = $(element).find('.user-text3 span a').text().trim();
        tweets.push({
          user: user,
          profile: profilePic,
          post: tweetContent,
          user_link: tweetLink
        });
      });

      return tweets;
    }

    const tweets = extractTweets(response.data);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).end(JSON.stringify({ creator: '@Samush_$', result: tweets }, null, 2));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
  }
});


app.get('/starlight/tiktok', async (req, res) => {  
    actualizarStats(req);
    let url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro url' }, null, 2));
    }
    try {
        let videoInfo = await tikVideo(url);

        let results = {
            creator: '@Samush_$',
            status: videoInfo.status,
            cover: videoInfo.cover,
            id: videoInfo.id,
            region: videoInfo.region,
            title: videoInfo.title,
            duration: videoInfo.duration,
            nowm: videoInfo.play,
            wm: videoInfo.wmplay,
            hd: videoInfo.hdplay,
            size: videoInfo.size,
            wm_size: videoInfo.wm_size,
            hd_size: videoInfo.hd_size,
            audio: videoInfo.music,
            audio_info: videoInfo.music_info,
            views: videoInfo.play_count,
            likes: videoInfo.digg_count,
            comments: videoInfo.comment_count,
            shared: videoInfo.share_count,
            downloads: videoInfo.download_count,
            saved: videoInfo.collect_count,
            author: videoInfo.author
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});



app.get('/starlight/chatgpt', (req, res) => {
    actualizarStats(req);
  let { Hercai } = require('hercai');
  let herc = new Hercai();
  let { text } = req.query;

  if (!text) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).end(JSON.stringify({ error: 'falta el parametro text' }, null, 2));
  }

  herc.question({ model: 'v3', content: text })
    .then(response => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).end(JSON.stringify({ creator: "@Samush_$", result: response.reply }, null, 2));
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    });
});


app.get('/starlight/turbo-gpt', (req, res) => {
    actualizarStats(req);
  let { Hercai } = require('hercai');
  let herc = new Hercai();
  let { text } = req.query;

  if (!text) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).end(JSON.stringify({ error: 'falta el parametro text' }, null, 2));
  }

  herc.question({ model: 'turbo', content: text })
    .then(response => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).end(JSON.stringify({ result: response.reply }, null, 2));
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    });
});



app.get('/starlight/instagram-DL', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' })
    }
    try {
        const result = await igsdl(url);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(500).json({ error: '://' });
    }
});


app.get('/starlight/soundcloud', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).end(JSON.stringify({ error: 'falta parametro url' }, null, 2));
    }

    try {
        const formData = {
            formurl: url
        };

        const response = await axios.post(
            'https://www.forhub.io/download.php',
            qs.stringify(formData),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const html = response.data;
        const $ = cheerio.load(html);

        const imageSrc = $('td.small-10.columns img').attr('src');
        const songTitle = $('td.small-10.columns').eq(1).text().trim();
        const quality = $('td.small-10.columns').eq(2).text().trim();
        const downloadLink = $('a[title="Right Click -> Save Link As..."]').attr('href');

        const result = {
            creator: '@Samush_$',
            title: songTitle,
            quality: quality,
            image: imageSrc,
            link: downloadLink
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).end(JSON.stringify(result, null, 2));

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).end(JSON.stringify({ error: '://' }, null, 2));
    }
});

app.get('/starlight/chochox/search', async (req, res) => {
    actualizarStats(req);
    const text = req.query.text;
    
    if (!text) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).end(JSON.stringify({ error: "falta el parametro text" }, null, 2));
    }

    try {
        const response = await axios.get(`https://chochox.com/?s=${text}`, {
            headers: {
                'content-type': 'text/html; charset=UTF-8',
                'vary': 'Accept-Encoding',
                'x-powered-by': 'PHP/7.4.33',
                'link': '<https://chochox.com/wp-json/>; rel="https://api.w.org/", <https://chochox.com/wp-json/wp/v2/pages/77910>; rel="alternate"; type="application/json", <https://chochox.com/?p=77910>; rel=shortlink',
                'x-frame-options': 'SAMEORIGIN',
                'cache-control': 'max-age=3600',
                'referrer-policy': 'no-referrer-when-downgrade, no-referrer-when-downgrade',
                'x-xss-protection': '1; mode=block',
                'x-content-type-options': 'nosniff',
                'access-control-allow-origin': '*'
            }
        });

        const $ = cheerio.load(response.data);
        const entries = [];

        $('.search-page .entry').each((index, element) => {
            const entry = {
                creator: "@Samush_$",
                title: $(element).find('h2.information a').text().trim(),
                image: $(element).find('a.popimg img').attr('src'),
                link: $(element).find('h2.information a').attr('href')
            };
            entries.push(entry);
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).end(JSON.stringify(entries, null, 2));

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).end(JSON.stringify({ error: "://" }, null, 2));
    }
});


app.get('/starlight/pindl', async (req, res) => {
    actualizarStats(req);
    let url = req.query.url
    if (!url) {
        return res.status(400).json({ error: 'falta parametro url' })
    }
    try {
        const result = await pindls(url)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).send(JSON.stringify(result, null, 4))
    } catch (error) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(500).json({ error: '://' })
    }
})

app.get('/starlight/mangadl', async (req, res) => {
    actualizarStats(req);
    const url = req.query.url;
    
    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).json({ error: 'falta parametro url' });
    }
    
    try {
        const data = await manga(url);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
        
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: '://' });
    }
});






async function ghpublish() {
    const repoOwner = "KrizDavidFdez";
    const repoName = "json";
    const filePath = "stats.json";
    const githubToken = "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";
    try {
        const fileContent = fs.readFileSync(statsFilePath, "utf-8");
        const encodedContent = Buffer.from(fileContent).toString("base64");
        let sha = null;
        try {
            const { data: fileData } = await axios.get(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
                { headers: { Authorization: `Bearer ${githubToken}` } }
            );
            sha = fileData.sha;
        } catch (error) {
                return;
            }
        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            {
                message: `Auto-update stats.json - ${new Date().toISOString()}`,
                content: encodedContent,
                sha: sha || undefined
            },
            { headers: { Authorization: `Bearer ${githubToken}` } }
        );
    } catch (error) {
    }
}















