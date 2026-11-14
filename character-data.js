// Only students with finished illustration + runtime models appear in the gallery.
import {illustrationStudents} from './illustration-students.js?v=20261114momoLive4';
export const illustratedStudents=[
 {id:'haru',name:'하루',roman:'HARU',subject:'심장생리',grade:1,role:'생리학부',color:'#c97b8b',portrait:'./assets/haru-fresh-airy.png',model:'./assets/haru.model3.json',accessory:'하트 머리핀',trait:'첫 박자',relation:'나기 · 쌍둥이',profile:'먼저 손을 내미는 쌍둥이. 승부욕은 강하지만, 막힌 친구를 두고 가지 못한다.',greeting:'왔네! 오늘은 내가 먼저 기다렸지.',lines:['나 쳐다보지 말고 앞에 봐, 우우. …나도 보고 있었지만.','나기가 또 창가에 있더라. 햇빛 좋은 자리는 어떻게 그렇게 잘 찾지?','헤헤, 방금 나 좀 멋있었어?','좋아! 오늘은 내가 네 옆에 있을게.']},
 {id:'nagi',name:'나기',roman:'NAGI',subject:'순환생리',grade:1,role:'생리학부',color:'#6b9c8d',portrait:'./assets/nagi-v1.png',model:'./assets/nagi.model3.json',accessory:'물방울 리본',trait:'잔잔한 흐름',relation:'하루 · 쌍둥이',relations:[{id:'haru',label:'쌍둥이'}],accessoryIcon:'ribbon',profile:'천천히 말을 고르는 쌍둥이. 부드러워 보여도, 자기 생각에는 작은 고집이 있다.',greeting:'여기… 앉을래? 창문은 조금 닫아 뒀어.',lines:['나는 괜찮으니까… 앞을 봐도 돼.','하루가 또 먼저 갔네. 괜찮아, 기다려 줄 거야.','오늘 화분에 새잎이 났어. …너한테 먼저 보여 주고 싶었어.','아직 아무도 안 왔는데… 나랑 먼저 있을래?','하루 없이도 괜찮아. 오늘은 내가 먼저 말 걸었잖아.','너는… 조용히 있어도 어색하지 않네.']},
 {id:'shiori',name:'시오리',roman:'SHIORI',subject:'심혈관약리',grade:1,role:'학생회 서기',color:'#9583b2',portrait:'./assets/shiori-v1.png',model:'./assets/shiori.model3.json',accessory:'책갈피 브로치',accessoryIcon:'bookmark',trait:'작은 주석',relation:'레이 · 학생회',relations:[{id:'rei',label:'학생회'},{id:'haru',label:'준비물 담당'}],profile:'남의 빈칸을 먼저 챙기는 학생회 서기. 정리에는 빈틈이 없는데, 자기 간식의 행방은 가끔 놓친다.',greeting:'왔네. 펜은 여기. 네가 또 두고 갈까 봐.',lines:[
  '내 쪽은 정리됐어. 네 쪽은?',
  '이 색인은 네 거야. 색 겹치면 헷갈리니까, 골라 봐.',
  '회장님 서랍? 비밀이야. …토끼가 있다는 말도 안 했어.',
  '지우개 찾고 있었지? 아까 네 팔 밑으로 굴러갔어.',
  '간식은 쉬는 시간에. …잠깐, 내 간식 어디 갔지?',
  '나 보면서 고개만 끄덕여도 다 알아. 한 줄도 안 넘겼잖아.',
  '하루한테 빌려준 펜은 늘 뚜껑이 먼저 돌아와.',
  '수첩 빌려줄까? 뒤쪽은 보지 마. 별거 없어. 그냥… 낙서.',
  '예정보다 빠르네. 좋아, 빈칸 하나 만들어 둘게.',
  '새 스티커? 응. 아직 붙일 곳은 못 정했어. 그럴 수도 있지.',
  '오늘은 네가 정리할래? 나는… 옆에서 볼게.',
  '이 책갈피는 네 거야. 빌려주는 거 아니고.'
 ]},
 {id:'rei',name:'레이',roman:'REI',subject:'심혈관병리',grade:1,role:'학생회장',color:'#9e788e',portrait:'./assets/rei-v1.png',model:'./assets/rei.model3.json',accessory:'은빛 프레임 브로치',accessoryIcon:'frame',trait:'남겨진 단서',relation:'시오리 · 학생회',relations:[{id:'shiori',label:'학생회'},{id:'nagi',label:'조용한 방문객'}],profile:'작은 단서에도 눈을 멈추는 1학년 학생회장. 반듯한 책상 서랍에는 아무에게도 보여 주지 않은 도장이 있다.',greeting:'왔구나. 자리는 비워 뒀어. 이유까지 물을 필요는 없고.',lines:[
  '시선은 그쪽. 나는 도망가지 않아.',
  '의자 높이는 맞아? …내 건 건드리지 마. 지금 딱 좋아.',
  '시오리가 없으면 조용해서 좋지. …조금 너무 조용하긴 하지만.',
  '그 도장? 공적인 용도야. 토끼 모양인 건 우연이고.',
  '작은 차이라고 그냥 넘기지 마. 네 표정도 아까랑 다르잖아.',
  '벌써 왔어? …아니, 놀란 건 아니고. 시계를 확인한 거야.',
  '그 리본은 누가 골라 줬어? 색이 잘 어울려. 그뿐이야.',
  '오늘 회의는 끝났어. 이제… 하고 싶은 얘기 해도 돼.',
  '너한테는 말투가 딱딱해진대. 시오리가. …그런가?',
  '이건 네가 가져. 두 개 산 건 아니야. 세 개 샀어.',
  '그렇게 빤히 보면 나도 신경 쓰이는데.',
  '여기서는… 그렇게 격식 차리지 않아도 돼.'
 ]}
 ,{id:'ritsu',name:'리츠',roman:'RITSU',subject:'심전도·전도·기기',grade:2,role:'방송부 · 음향 담당',color:'#6e9fbe',portrait:'./assets/ritsu-v1.png',model:'./assets/ritsu.model3.json',accessory:'박자 이어커프',trait:'정확한 간격',relation:'이부키 · 방송부',relations:[{id:'ibuki',label:'방송부 콤비'},{id:'haru',label:'기초와 해석'}],profile:'작은 차이를 먼저 알아채는 2학년 방송부원. 조용히 웃긴 말을 하고, 상대가 웃을 때까지 조금 기다린다. 오래된 노래와 손수 고친 이어폰을 아낀다.',greeting:'왔어? …의자 소리로 알았어.',lines:['이어커프? 가까이서 보면 작은 파란 선이 있어.','방금 농담이었어. 늦게 웃어도 괜찮아.','조용하다고 안 삐지는 건 아니거든.','이부키가 떠들면 나는 소리를 맞춰. 서로 할 일이 있는 거지.','네 발소리는 이제 구별돼. 오늘도 맞혔어.','잠깐 더 앉아 있다 가자. 꼭 할 얘기가 있어야 하는 건 아니잖아.']}
,...illustrationStudents
];
