export const sceneAssets={
 dawn:{name:'테라스',src:'./assets/scenes/dawn-terrace-v1.jpg'},
 morning:{name:'교실',src:'./assets/lobby-room.png'},
 noon:{name:'카페',src:'./assets/scenes/cafe-noon-v1.jpg'},
 afternoon:{name:'온실',src:'./assets/scenes/garden-afternoon-v1.jpg'},
 evening:{name:'정원',src:'./assets/scenes/courtyard-evening-v1.jpg'},
 night:{name:'도서실',src:'./assets/scenes/library-night-v1.jpg'},
 desk:{name:'서기실',src:'./assets/scenes/quest-desk-v1.jpg'}
};
export function sceneStrip(id,className=''){
 const image=document.createElement('img');image.className='sceneStrip '+className;image.src=sceneAssets[id].src;image.alt='';image.loading='lazy';image.decoding='async';image.width=1024;image.height=1536;return image;
}
