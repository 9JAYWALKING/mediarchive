// Native SVG illustrations match the existing in-app accessory artwork.
export const accessoryArt=Object.freeze({
  "haru": {
    "name": "하트 머리핀",
    "src": "./assets/accessories/haru.svg"
  },
  "nagi": {
    "name": "물방울 리본",
    "src": "./assets/accessories/nagi.svg"
  },
  "shiori": {
    "name": "책갈피 브로치",
    "src": "./assets/accessories/shiori.svg"
  },
  "rei": {
    "name": "은빛 프레임 브로치",
    "src": "./assets/accessories/rei.svg"
  },
  "ritsu": {
    "name": "박자 이어커프",
    "src": "./assets/accessories/ritsu.svg"
  },
  "ibuki": {
    "name": "번개 지퍼 참",
    "src": "./assets/accessories/ibuki.svg"
  },
  "mio": {
    "name": "매듭 팔찌",
    "src": "./assets/accessories/mio.svg"
  },
  "sena": {
    "name": "유리꽃 핀",
    "src": "./assets/accessories/sena.svg"
  },
  "aoi": {
    "name": "나침반 참",
    "src": "./assets/accessories/aoi.svg"
  },
  "akari": {
    "name": "작은 태양 배지",
    "src": "./assets/accessories/akari.svg"
  },
  "momo": {
    "name": "토끼 가방 참",
    "src": "./assets/accessories/momo.svg"
  },
  "tsumugi": {
    "name": "실매듭 키링",
    "src": "./assets/accessories/tsumugi.svg"
  }
});
export function accessoryFor(student){return accessoryArt[student]||null;}
