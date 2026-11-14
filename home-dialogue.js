import {illustrationHome} from './illustration-context.js?v=20261114studentVoices';
import {ritsuHome} from './ritsu-dialogue.js?v=20261110ritsu';
// Home-only performances; explicit study actions retain their own acknowledgement.
const lines=text=>text.trim().split('\n').map(row=>{const at=row.indexOf('|');return Object.freeze({expression:row.slice(0,at),text:row.slice(at+1)});});
export const homeDialogue={...illustrationHome,
 ritsu:ritsuHome,
 haru:{
  greeting:lines(`happy|왔어? 가방부터 내려놔! 오늘은 여기서 뒹굴뒹굴할 거야.
smile|집에 오니까 갑자기 졸려… 아까까진 멀쩡했는데!
soft|{teacher} 선생님, 오늘도 고생했어. 이제 편하게 앉아!
sleepy|기다리다가 쿠션이랑 조금 친해졌어. …잠든 건 아니고!`),
  touch:lines(`smile|이 토끼 귀 만져 봐. 엄청 보들보들하지? 내 베개 다음으로 좋아.
sleepy|하암… 방금 하품 너한테 옮았지? 헤헤, 우리 둘 다 자야겠다.
happy|잠옷 주머니에 뭐 있게? …아무것도 없어. 간식이 있었으면 좋겠어.
soft|오늘 얘기는 내일 이어서 해도 되지? 나 듣다가 잠들 것 같아.
smile|여기 앉으니까 일어나기 싫다. 물 마시러 가는 것도 큰 결심이야.
sleepy|안 졸리냐고? 응! …방금 대답하는 사이에 조금 졸려졌어.
soft|잘 자라는 말은 내가 먼저 할래. 잘 자! 내일 또 보자.
smile|오늘 재밌었던 일 하나만 얘기하고 자자. 나는 네가 웃었던 거!`),
  quiet:lines(`sleepy|눈 감으면 바로 잘 수 있을 것 같아… 오늘은 여기까지 하자.
soft|불은 조금만 남겨 둘까? 너무 밝으면 잠 안 오잖아.
smile|내일 아침에 만나면 내가 먼저 손 흔들게. 못 본 척하면 안 돼!
soft|오늘은 진짜 수고했어. 이제 아무것도 안 해도 돼.`),
  start:lines(`calm|조금만 더 볼 거야? 그럼 끝낼 곳 하나만 정하자. 졸리면 바로 쉬고!
soft|응, 옆에 있을게. 대신 하품 나오기 시작하면 오늘은 마무리하자.`),
  pause:lines(`happy|쉬는 시간! 이번엔 진짜 푹 쉬는 거야. 쿠션 하나 줄까?
sleepy|어깨 내려 봐. 나도 이렇게… 아, 기지개 켜니까 더 졸려.`),
  finish:lines(`happy|끝났다! 이제 책 덮고 편하게 쉬자. 오늘도 고생했어!
soft|오늘은 여기까지. 내일도 같이 보자. 잘 자!`)
 },
 nagi:{
  greeting:lines(`soft|왔구나… 편한 데 앉아. 여기 담요도 있어.
smile|밖은 좀 추웠지? 방은 따뜻하게 해 뒀어.
sleepy|집에 오니까 마음이 놓여서 그런가… 눈이 자꾸 감겨.
soft|{teacher} 선생님, 오늘 고생 많았어. 이제는 조금 쉬자.`),
  touch:lines(`soft|이 담요, 반 접으면 더 따뜻해. 너도 덮을래…?
sleepy|응… 듣고 있어. 대답이 조금 느려도 잠든 건 아니야.
smile|창밖 불이 하나씩 꺼지네. 우리도 슬슬 잘 준비할까.
soft|오늘 있었던 일은… 내일 천천히 얘기해 줘도 좋아.
calm|컵은 이쪽에 둘게. 자다 깨서 목마르면 멀리 안 가도 되게.
sleepy|아까부터 베개 생각만 하고 있었어. 조금 웃기지…?
soft|잘 자. 내일 아침에도 인사해 줘. 그럼 좋을 것 같아.
smile|조용히 같이 있으니까 좋다. 무슨 말을 해야 할지 안 찾아도 되고.`),
  quiet:lines(`sleepy|나는 이제 누우려고… 너도 너무 늦게 자진 마.
soft|하루가 길었지? 지금은 아무것도 서두르지 않아도 돼.
calm|커튼은 닫아 둘게. 아침 햇빛은 조금만 들어오도록.
soft|내일 만나자. 푹 자고, 편한 얼굴로.`),
  start:lines(`calm|조금 남았어…? 그럼 무리하지 않는 만큼만 같이 보자.
soft|난 옆에 있을게. 졸리면 멈춰도 괜찮아. 내일 이어 보면 되니까.`),
  pause:lines(`soft|잠깐 기대서 쉬어. 물 필요하면 여기 있어.
sleepy|책은 덮어 둘까…? 지금은 눈도 조금 쉬게 해 주자.`),
  finish:lines(`smile|다 했구나… 수고했어. 이제 편하게 쉬어도 되겠다.
soft|나머지 얘기는 내일 하자. 오늘 같이 있어 줘서 좋았어. 잘 자.`)
 },
 shiori:{
  greeting:lines(`smile|왔어? 가방은 거기 두고, 먼저 편하게 앉아.
calm|집에 왔으면 어깨 힘부터 빼. 아직도 긴장하고 있잖아.
soft|{teacher} 선생님, 오늘은 수첩 덮었어. 나도 이제 쉴 거니까.
sleepy|늦었네. 나도 방금 잘 준비 끝냈어. …아직 머리는 좀 말려야 하지만.`),
  touch:lines(`calm|알람 맞췄어? 그럼 휴대폰 내려놔도 되겠네.
smile|이 잠옷 주머니 생각보다 편해. …펜 넣으려다가 참았어.
soft|담요는 가져가도 돼. 나는 하나 더 있어. 추운 거 참지 말고.
sleepy|졸린 거 아니라고 하려 했는데… 하품이 먼저 나왔네.
smile|충전기는 꽂아 뒀어. 이런 건 생각났을 때 해 두는 게 편하니까.
calm|내일 할 일은 한 줄이면 돼. 지금 새 목록 만드는 건 금지.
soft|오늘 고생했어. 이건 그냥 하는 말 아니야. 잘 자.
smile|책상 정리는 내일 해도 되겠지? 오늘은 나도 조금 봐주려고.`),
  quiet:lines(`sleepy|지금은 자는 게 먼저야. 나도 불 끌 준비할게.
soft|하루 종일 애썼으니까, 쉬는 동안까지 잘하려고 하진 마.
calm|물 한 모금 마시고 눕자. 휴대폰은 손 닿는 데서 조금 멀리 두고.
smile|내일 봐. …늦게까지 이 인사 반복하게 하진 말고.`),
  start:lines(`calm|지금 시작할 거면 끝낼 곳부터 정해. 새로 많이 벌이지는 말고.
soft|조금만 같이 볼게. 졸리면 내일로 넘겨도 돼. 그건 미룬 게 아니야.`),
  pause:lines(`calm|좋아, 잠깐 쉬자. 쉬면서 다음 할 일 찾지는 말고.
soft|오늘은 이대로 마무리해도 괜찮아. 네가 얼마나 했는지 알고 있어.`),
  finish:lines(`smile|끝났네. 책갈피 꽂았으면 오늘 할 일은 끝이야. 편하게 쉬어.
soft|이제 진짜 잘 시간이야. 내일 봐. …오늘도 수고했어.`)
 },
 rei:{
  greeting:lines(`soft|왔구나. 여기에선 편하게 있어. 나도 오늘 일은 내려놓았어.
smile|돌아왔네. 따뜻한 방에 있으니 좀 낫지? 잠깐 앉아서 쉬어.
calm|늦은 시간이야. 하고 싶었던 이야기는 천천히 해도 돼.
soft|{teacher} 선생님, 오늘도 수고했어. 지금은 쉬러 온 거지?`),
  touch:lines(`soft|여기까지 와서 격식 차릴 필요 없어. 나도 편하게 이야기하고 싶으니까.
sleepy|졸려 보인다고? …집에서는 얼굴에 바로 드러나나 봐.
smile|이 쿠션은 생각보다 푹신해. 잠깐 기대려다 오래 앉아 있게 돼.
calm|창문은 잠갔어. 이제 마음 놓고 쉬면 되겠네.
soft|오늘 마음에 걸리는 일이 있어도, 잠들기 전까지 붙잡고 있진 마.
smile|내일 아침에 다시 이야기하자. 맑은 정신으로 네 얘기를 듣고 싶어.
sleepy|책을 읽으려 했는데 같은 쪽을 두 번 펼쳤어. 오늘은 그만해야겠네.
soft|잘 자. 내일도 무사히 만나자. 그거면 좋겠어.`),
  quiet:lines(`soft|오늘은 충분히 애썼어. 이 방에서까지 무리할 필요는 없어.
sleepy|나도 이제 쉬려고 해. 너도 함께 하루를 마무리하자.
calm|조명은 조금 낮춰 둘게. 눈도 편히 쉬도록.
soft|내일 볼 얼굴이 있다는 건 좋은 일이네. 잘 자.`),
  start:lines(`calm|잠깐 더 보겠다면 함께할게. 다만 끝내는 시간은 지켜 줘.
soft|남은 것 하나만 확인하자. 나머지는 내일 차분히 봐도 괜찮아.`),
  pause:lines(`soft|잘 멈췄어. 지금은 편히 기대서 쉬어도 돼.
calm|어깨부터 풀자. 여기선 급하게 돌아갈 필요 없어.`),
  finish:lines(`smile|수고했어. 이제 책은 놓아두고 편하게 쉬자.
soft|오늘은 이만 마무리하자. 내일도 함께할게. 잘 자.`)
 }
};
export function homePool(student,group='touch'){
 const key=['greeting','return','morning'].includes(group)?'greeting':['start','resume','early'].includes(group)?'start':['finish','shortFinish'].includes(group)?'finish':group==='pause'?'pause':['quiet','long','routine','night','encourage'].includes(group)?'quiet':'touch';
 return {key:'home:'+key,lines:(homeDialogue[student]||homeDialogue.haru)[key]};
}
