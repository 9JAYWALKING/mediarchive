// Short authored scenes. Manual playback only: no study or bond rewards.
export const characterStories=[
 {id:'lost-snack',title:'서기의 분실물',owner:'shiori',cast:['shiori','haru'],beats:[
  {speaker:'shiori',text:'하루, 펜 뚜껑. 그리고 네가 두고 간 지우개.'},
  {speaker:'haru',text:'우와, 어떻게 다 찾아? 내 가방보다 네가 더 잘 알아!'},
  {speaker:'shiori',text:'제자리에 놓으면 안 잃어버려. 기본이야.'},
  {speaker:'haru',text:'그럼 아까부터 찾는 건 뭔데?'},
  {speaker:'shiori',text:'…쿠키. 쉬는 시간에 먹으려고 했는데.'},
  {speaker:'haru',text:'네 수첩 밑에 있는 봉투는?'},
  {speaker:'shiori',text:'아. …보관 위치를 바꿨었네.'},
  {speaker:'shiori',text:'둘 다 웃지 마. 한 개씩 줄 거니까.'}
 ]},
 {id:'rabbit-stamp',title:'회장의 도장',owner:'rei',cast:['rei','shiori'],beats:[
  {speaker:'rei',text:'확인 끝났어. 여기에는 도장만 찍으면 돼.'},
  {speaker:'shiori',text:'회장님, 그건 토끼 도장인데요.'},
  {speaker:'rei',text:'…알고 있어. 시험 삼아 꺼낸 거야.'},
  {speaker:'shiori',text:'귀가 두 개라 확인 표시도 두 번 되겠네요.'},
  {speaker:'rei',text:'시오리.'},
  {speaker:'shiori',text:'네. 아무 말도 안 했어요.'},
  {speaker:'rei',text:'너도 보고 싶어? …한 번만. 수첩 이리 줘.'},
  {speaker:'rei',text:'번지니까 바로 덮지 마. 잘 말려서 가져가.'}
 ]},
 {id:'one-empty-slot',title:'빈칸 하나',owner:'shiori',cast:['shiori','rei'],beats:[
  {speaker:'rei',text:'시오리, 이 시간은 왜 비어 있어?'},
  {speaker:'shiori',text:'비워 둔 거예요. 회장님이 또 일 넣으실까 봐.'},
  {speaker:'rei',text:'빈칸이면 일을 넣는 게 맞지 않아?'},
  {speaker:'shiori',text:'차 마시는 시간이에요. 이미 예약됐어요.'},
  {speaker:'rei',text:'누가 예약했는데?'},
  {speaker:'shiori',text:'저랑… 지금 문 앞에 있는 사람.'},
  {speaker:'rei',text:'아. 왔구나. 거기 서 있지 말고 앉아.'},
  {speaker:'shiori',text:'찻잔은 세 개 꺼내 뒀어요. 쿠키도 이번엔 안 잃어버렸고.'},
  {speaker:'rei',text:'그 얘기는 안 해도 됐을 텐데.'}
 ]}
];
export const storiesFor=id=>characterStories.filter(s=>s.cast.includes(id));
