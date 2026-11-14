import {illustrationRecall} from './illustration-recall.js?v=20261114studentVoices';
import {illustrationBanks} from './illustration-dialogue.js?v=20261114studentVoices';
// Only conversational phrasing changes; names, numbers, arrows and qualifiers stay intact.
const voices={
 haru:{ask:['좋아, 내 차례!','이번엔 이거!','자, 떠올려 봐.','이건 기억나?'],answer:['자, 같이 맞춰 보자!','내 답은 이거야.','여기까지 연결하면 돼!','하나씩 보면 이래.'],wait:['calm','smile','soft'],question:['smile','happy','calm'],reveal:['smile','happy','soft'],ending:'어때, 나랑 한 바퀴 다 돌았네!'},
 nagi:{ask:['우리… 이거부터 떠올려 볼까?','천천히 생각해도 괜찮아.','이번엔 내가 물어볼게.','응, 여기서 하나만.'],answer:['응… 같이 확인해 보자.','나는 이렇게 정리했어.','하나씩 이어 보면 이래.','서두르지 말고, 같이 봐.'],wait:['calm','soft','smile'],question:['smile','soft','calm'],reveal:['soft','smile'],ending:'끝까지 같이 봤네. …나도 좋았어.'},
 shiori:{ask:['이번 칸은 네 차례야.','자, 여기부터 확인하자.','순서대로 정리해 볼래?','이건 빠뜨리면 안 되지.'],answer:['여기는 이렇게 정리해 두자.','내가 적어 둔 건 이거야.','빠진 데 없는지 같이 보자.','이 칸에는 이렇게 들어가.'],wait:['calm','smile'],question:['calm','smile'],reveal:['smile','soft','calm'],ending:'빈칸 없이 다 봤네. …수고했어.'},
 rei:{ask:['그럼, 이건 어떻게 생각해?','여기서는 근거를 짚어 보자.','좋아. 다음 질문이야.','이번에도 차근차근.'],answer:['근거까지 이어 보면 이래.','여기서 확인할 건 이거야.','이렇게 구분하면 돼.','답은 여기까지야. 같이 보자.'],wait:['calm','smile'],question:['calm','smile'],reveal:['smile','soft','calm'],ending:'마지막까지 봤구나. 잘했어, 정말로.'},
 ritsu:{ask:['이번엔 여기.','…기억나?','좋아. 다음.','잠깐, 이것도.'],answer:['…응, 이렇게.','여기까지 연결돼.','내가 짚은 건 이거야.','천천히. 같이 확인해.'],wait:['calm','smile'],question:['calm','smile'],reveal:['smile','soft','calm'],ending:'끝까지 왔네. …박자, 잘 맞았어.'},
 momo:{ask:['후후, 이번엔 네 차례.','선배가 하나 물어볼게.','자, 이건 기억나려나?','천천히 해. 기다려 줄게.'],answer:['선배랑 같이 확인해 볼까?','후후, 이렇게 생각하면 돼.','여기는 이렇게 이어져.','자, 답을 펼쳐 볼게.'],wait:['soft','smile'],question:['smile','soft'],reveal:['soft','happy','smile'],ending:'후후, 끝까지 잘 따라왔네. 선배도 즐거웠어.'}
};
Object.assign(voices,illustrationRecall);
export const recallVoices=voices;
const conjugations=[['때문이다','때문이야'],['것이다','거야'],['수 있다','수 있어'],['수 없다','수 없어'],['된다','돼'],['한다','해'],['있다','있어'],['없다','없어'],['이다','이야'],['생긴다','생겨'],['나타난다','나타나'],['줄어든다','줄어들어'],['늘어난다','늘어나'],['높인다','높여'],['낮춘다','낮춰'],['올린다','올려'],['시킨다','시켜'],['이어진다','이어져'],['보인다','보여'],['달라진다','달라져'],['커진다','커져'],['작아진다','작아져'],['빠르다','빨라'],['느리다','느려'],['다르다','달라'],['높다','높아'],['낮다','낮아'],['크다','커'],['작다','작아'],['길다','길어'],['짧다','짧아'],['어렵다','어려워'],['쉽다','쉬워']];
const extraConjugations=[['하다','해'],['했다','했어'],['본다','봐'],['위해서다','위해서야'],['줄인다','줄여'],['만든다','만들어'],['읽는다','읽어'],['막는다','막아'],['고른다','골라'],['않는다','않아'],['따른다','따라'],['배다','배야'],['올라간다','올라가'],['내려간다','내려가'],['진다','져'],['둔다','둬'],['찾는다','찾아'],['붙인다','붙여'],['넓힌다','넓혀'],['초다','초야'],['전위차다','전위차야'],['뛴다','뛰어'],['들어온다','들어와'],['장소다','장소야'],['흐른다','흘러'],['놓인다','놓여'],['분모다','분모야'],['때다','때야'],['변화다','변화야'],['늘린다','늘려'],['기울기다','기울기야'],['많다','많아'],['지표다','지표야'],['그렇다','그래'],['지킨다','지켜'],['아니다','아니야'],['통로다','통로야'],['차단제다','차단제야'],['순서다','순서야'],['문제다','문제야'],['끊긴다','끊겨'],['별개다','별개야'],['석회화다','석회화야'],['죽상경화다','죽상경화야'],['적다','적어'],['남는다','남아'],['붙는다','붙어'],['먼저다','먼저야'],['범위다','범위야'],['살핀다','살펴'],['관계다','관계야'],['나눈다','나눠'],['준다','줘'],['않다','않아']];
export function spokenAnswer(text){let value=text;for(const [from,to] of [...conjugations,...extraConjugations].sort((a,b)=>b[0].length-a[0].length))value=value.replace(new RegExp(from+'(?=[.!?](?:\\s|$)|$)','g'),to);return value;}
function spokenQuestion(text,student){
 if(/설명해 보자\.$/.test(text))return text.replace(/설명해 보자\.$/,student==='ritsu'?'설명해 봐.':student==='nagi'?'설명해 줄래?':'설명해 볼래?');
 if(/연결해 보자\.$/.test(text))return text.replace(/연결해 보자\.$/,'연결해 볼래?');
 if(/(은|는)\?$/.test(text))return text.replace(/\?$/,student==='ritsu'?' 기억나?':student==='rei'?' 어떻게 정리할 수 있을까?':student==='momo'?' 뭐였더라?':' 뭐였지?');
 return text;
}
export function recallLine(item,student,phase){const v=voices[student]||voices.rei;let hash=0;for(const c of item.id)hash=(hash*31+c.charCodeAt(0))>>>0;return (phase==='answer'?v.answer[hash%v.answer.length]+'\n'+spokenAnswer(item.answer):v.ask[hash%v.ask.length]+'\n'+spokenQuestion(item.question,student));}
export function recallExpression(student,phase,previous,random=Math.random){const v=voices[student]||voices.rei,pool=v[phase]||v.question,choices=pool.filter(x=>x!==previous);return (choices.length?choices:pool)[Math.floor(random()*(choices.length||pool.length))];}
const feedback={
 haru:{good:['잘하고 있어! 이 기세로 다음 것도 가 보자!','오, 꽤 기억하고 있네! 나도 신난다.'],steady:['조금 헷갈렸지? 괜찮아, 한 번씩 더 잡아 보자!','아는 것도 많잖아. 애매한 것부터 같이 보자.'],hard:['음, 좀 어려웠나? 잠깐 숨 돌리고 하나씩 가자.','우우, 만만한 상대가 아니네. 그래도 내가 옆에 있잖아!']},
 nagi:{good:['응… 잘하고 있어. 네가 기억해 줘서 기뻐.','하나씩 잘 이어지고 있네. 우리 이대로 가 볼까?'],steady:['조금 흐릿한 것도 있지…? 다시 보면 또 떠오를 거야.','괜찮아. 확실한 것부터 천천히 이어 가자.'],hard:['조금 어려웠나 봐… 서두르지 않아도 괜찮아.','내가 기다릴게. 헷갈린 곳부터 같이 다시 보자.']},
 shiori:{good:['좋아. 빈칸이 많이 줄었네. 이대로 정리하자.','꽤 정확했어. 다음 장도 준비해 뒀어.'],steady:['애매한 칸은 표시해 뒀어. 나중에 같이 확인하자.','여기 몇 군데만 더 챙기면 되겠네. 계속해 볼까?'],hard:['음, 정리할 게 좀 남았네. 한꺼번에 외우려 하진 말고.','비슷한 것끼리 섞였나 봐. 하나씩 나눠서 다시 보자.']},
 rei:{good:['잘하고 있어. 구분해야 할 곳도 놓치지 않았네.','응, 지금 흐름은 좋아. 다음으로 가자.'],steady:['확신이 없는 곳은 남겨 두자. 근거를 다시 보면 돼.','조금만 더 구분해 보자. 서두를 필요는 없어.'],hard:['오늘은 좀 어렵구나. 기초부터 짚어도 괜찮아.','틀린 곳을 알아낸 것도 의미가 있어. 같이 다시 보자.']},
 ritsu:{good:['…잘하고 있어. 박자도 안 놓치고.','응. 안정적이야. 다음도 해 보자.'],steady:['몇 군데 흔들렸네. 천천히 짚어 보자.','애매했던 데는 기억해 둘게. 다음에 다시 맞춰 보자.'],hard:['…좀 어려웠나. 속도부터 낮추자.','괜찮아. 처음부터 한 칸씩. 나도 같이 볼게.']},
 momo:{good:['후후, 잘하고 있네! 선배가 괜히 기다린 게 아니지?','어라, 제법인데? 다음 것도 기대해도 되겠네.'],steady:['조금 헷갈린 건 표시해 두자. 선배랑 다시 보면 되지.','아는 것도 많잖아? 나머지는 천천히 채우자.'],hard:['음, 좀 어려웠어? 선배가 옆에서 기다려 줄게.','오늘은 만만하지 않네. 괜찮아, 하나씩 다시 해 보자.']}
};
for(const [id,bank] of Object.entries(illustrationBanks))feedback[id]={good:bank.finish.map(l=>l.text.replace('{teacher} 선생님','선생님')),steady:bank.encourage.map(l=>l.text),hard:bank.long.map(l=>l.text)};
export function feedbackLine(student,quality,random=Math.random){const list=(feedback[student]||feedback.rei)[quality];return {text:list[Math.floor(random()*list.length)],expression:quality==='good'?recallExpression(student,'reveal'):quality==='hard'?'soft':'calm'};}
