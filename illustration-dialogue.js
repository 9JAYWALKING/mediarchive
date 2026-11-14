import {illustrationRoutine} from './illustration-context.js?v=20261114studentVoices';
import {illustrationExtras} from './illustration-dialogue-extra.js?v=20261114studentVoices';
const parse=text=>text.trim().split('\n').filter(Boolean).map(row=>{const [expression,...rest]=row.split('|');return {expression,text:rest.join('|')};});
const keys=['greeting','early','start','touch','tease','quiet','long','pause','resume','finish','shortFinish','sister','everyday','bond','encourage'];
const raw={
ibuki:`happy|어서 와! 오늘 방송은 네 옆자리에서 시작합니다!~smile|{teacher} 선생님 입장! 박수는 내가 칠게.
happy|내 오프닝보다 빨리 왔네? 좋아, 즉석으로 간다!~calm|아직 시작 전이니까 헷갈리는 곳 하나만 골라 보자.
smile|자, 오늘의 첫 순서! 네가 고르면 내가 받아 줄게.~calm|갈림길부터 보자. 급할수록 순서는 정확하게.
happy|방금 표정 봤어? 리츠 농담에 내가 먼저 웃었어.~smile|이 번개? 지퍼에 달았더니 걸을 때마다 신나게 흔들려.
angry|진행자만 보면 내용 놓친다니까!~smile|{teacher} 선생님, 내 얼굴에 정답 자막은 없어.
calm|지금은 조용한 편성이야. 마음껏 집중해.~smile|말 안 하고 있는 거야. 고장 난 거 아니거든?
calm|같은 데서 막혔어? 조건 하나씩 짚자.~smile|속도 잠깐 낮춰도 돼. 중요한 장면이잖아.
happy|잠깐 광고 시간! 어깨부터 풀자.~smile|물 가져올게. 너도 의자에서 일어나 봐.
happy|쉬는 시간 종료! 다시 네 차례!~calm|아까 표시한 갈림길부터 이어 가자.
happy|오늘 편성 끝! 끝까지 함께해 준 선생님께 박수!~smile|{teacher} 선생님, 약속한 데까지 잘 왔네.
smile|짧은 특별 편성이었네. 다음에 이어 가자.~calm|표시만 남겨. 다음 시작점은 기억해 둘게.
happy|리츠가 웃기면 세 박자 뒤에 웃어 봐. 본인이 더 좋아해.~smile|시오리가 내 대본에 쉼표를 넣었어. 숨 좀 쉬래.
smile|리듬게임 마지막 한 번만! …아, 그 말은 한 번만 하기로 했지.~happy|새 간식 이름을 맞히는 방송 어때? 상품은 반쪽씩!
soft|네 앞에서는 말이 없어도 어색하지 않네.~smile|내가 웃겼을 때 네가 제일 먼저 웃으면 좋더라.
calm|한 번 틀렸다고 바로 다음 걸로 도망가지 말자.~smile|이번에 구분한 조건 하나, 그거면 다음엔 달라져.` ,
mio:`smile|잘 왔어. 네 자리도 조금 넓혀 뒀어.~soft|{teacher} 선생님, 따뜻한 물 아직 남아 있어.
smile|일찍 왔네. 서두르지 말고 같이 준비하자.~calm|낯선 부분부터 조금씩 보고 가면 마음이 편하겠지.
smile|오늘은 어디까지 볼까? 감당할 만큼만 정하자.~calm|원인부터 이어 보면 복잡한 것도 조금씩 풀려.
soft|팔찌 매듭이 풀렸네. 잠깐, 내가 묶어 줄게.~smile|이 의자 괜찮아? 나는 이쪽도 편해.
smile|나도 보고 싶지만… 앞에 펼친 게 기다리는데?~soft|{teacher} 선생님, 그렇게 보면 나도 손이 느려져.
calm|천천히 해. 지금은 말 걸지 않고 있을게.~soft|잘 안 풀리는 날도 있지. 혼자 두진 않을게.
calm|범위가 넓어서 그래. 작은 부분으로 나누자.~soft|계속 같은 줄이면 잠깐 눈을 쉬게 해 줘.
smile|잘 멈췄어. 따뜻한 것 좀 마실래?~calm|네가 쉬는 동안 나도 손을 좀 풀어야겠다.
smile|다시 앉았네. 아까 남긴 곳부터 볼까?~soft|한 번에 다 만회하려고 하지 않아도 돼.
happy|오늘 몫을 다 봤네. 마음이 놓인다.~soft|{teacher} 선생님도 고생했어. 이제 너부터 챙겨.
smile|잠깐이어도 같이 봐서 좋았어.~calm|다음에 이어 볼 곳만 접어 두자.
smile|하루는 내가 부탁하기 전에 먼저 손을 들어 줘.~soft|츠무기는 다 고친 뒤에도 불편한 곳이 없는지 물어봐.
smile|목도리를 뜨는데 자꾸 길어져. 둘이 써야 하나?~soft|차가 너무 뜨거우면 조금 기다리는 편이 좋아.
soft|오늘은 내 부탁도 들어 줄래? 같이 차 고르러 가자.~smile|네가 내 몫도 챙겨 주면… 조금 낯설고, 좋네.
smile|지금 연결한 한 부분은 네가 해낸 거야.~calm|왜 틀렸는지 알았으면 거기서 다시 시작하면 돼.` ,
sena:`calm|왔네. 창가 쪽 눈부시면 말해.~smile|{teacher} 선생님, 오늘은 내가 먼저 알아봤어.
smile|아직 한산하네. 먼저 볼 시간이 있겠다.~calm|제목만 보고 넘기지 말고 낯선 단서 하나 찾아 봐.
calm|이번엔 어디를 볼래? 가까이서 보자.~smile|전체를 보고, 차이를 찾고. 순서는 네가 골라.
smile|머리에 작은 실이 붙었어. …됐어.~calm|사진을 찍는 건 아니야. 그냥 보고 있었어.
calm|초점이 어긋났네. 네가 볼 건 저쪽인데.~smile|{teacher} 선생님, 그렇게 보면 나도 표정 관리가 안 돼.
calm|지금은 셔터 소리도 안 낼게.~soft|작은 변화도 보여. 아까보다 표정이 편해졌네.
calm|비슷한 둘을 나란히 놓아 봐. 차이가 드러날 거야.~smile|못 본 건 다시 보면 돼. 지나친 곳부터.
smile|먼 곳 좀 볼까? 창밖 나뭇잎이 흔들려.~calm|눈이 피곤하면 작은 단서도 흐려져. 잠깐 쉬자.
calm|돌아왔네. 아까 안 보이던 데부터.~smile|시선이 좀 맑아졌어. 다시 볼까?
smile|오늘은 여기까지. 놓친 곳도 표시했지?~soft|{teacher} 선생님, 마지막까지 잘 봤어.
calm|짧게 봤어도 남는 장면은 있겠지.~smile|다음에 볼 부분은 그대로 두자.
smile|레이와 같은 사진을 봤는데 서로 다른 걸 찾았어.~soft|모모 선배가 넘어질 뻔한 사진은 지웠어. 부탁받기 전에.
calm|내 사진은 좀 어색하더라. 찍는 쪽이 편해.~smile|유리꽃 핀은 빛 방향에 따라 색이 달라져.
soft|네가 찍어 준 사진은 안 지웠어.~smile|이번엔 나도 같이 찍을까. 네 옆이면 괜찮을 것 같아.
calm|답부터 떠올리기보다 보이는 단서부터 말해 봐.~smile|방금 찾은 차이, 그걸 기억하면 돼.` ,
aoi:`happy|왔구나! 오늘도 길은 같이 고르자.~smile|{teacher} 선생님, 네 자리까지 오는 길은 외웠지?
happy|지름길 찾았어? 나보다 빨랐네!~calm|남은 시간에 낯선 갈림길부터 살펴보자.
smile|출발 전에 어디까지 갈지 정하자.~calm|조건을 바꾸면 방향도 바뀌어. 하나씩 비교해 봐.
happy|나침반이 귀엽지? 실제 길은 지도도 같이 봐야 해.~smile|오늘 산책길은 그늘이 많은 쪽으로 골랐어.
smile|나만 보면 길 놓친다? 앞도 봐 줘.~happy|{teacher} 선생님, 내 얼굴이 목적지는 아니잖아!
calm|잠깐 조용히 길을 확인할게. 너도 집중해.~smile|멈춰 있는 것 같아도 방향을 고르는 중일 수 있지.
calm|가지가 많으면 시작점을 하나로 잡아 보자.~smile|헤매는 곳을 알면 표지판을 세울 수 있어.
happy|쉬는 길로 잠깐 빠지자! 바람 쐬러 갈래?~smile|물 한 모금 먼저. 오래 걸었잖아.
smile|다시 출발! 아까 표시한 곳 보이지?~calm|속도보다 방향부터 맞추고 가자.
happy|오늘 목적지 도착! 잘 따라왔네.~smile|{teacher} 선생님, 돌아가는 길은 느긋하게 걷자.
smile|짧은 코스도 좋지. 다음 길은 남겨 두자.~calm|어디서 멈췄는지만 표시해 두면 돼.
smile|나기랑 산책하면 평소 안 보던 꽃을 보게 돼.~happy|아카리는 출발부터 하재. 난 돌아오는 길도 정하고 싶은데!
smile|여행 계획을 고치다 출발이 늦었어. 이번엔 진짜 확정!~happy|새 골목을 찾았어. 빵 냄새가 좋은 쪽이야.
soft|오늘은 목적지가 없어도 괜찮을 것 같아.~smile|너랑 걷던 길은 나중에도 잘 기억나.
calm|틀린 길을 표시한 것도 다음에 도움이 돼.~smile|처음 갈림길로 돌아가자. 이번엔 같이 고를게.` ,
akari:`happy|왔으면 앉아! 오늘도 하나씩 끝내자.~smile|{teacher} 선생님, 좋은 자리 잡아 뒀어.
happy|먼저 움직였네. 그런 거 좋아!~calm|시작 전에 까다로운 조건부터 훑자.
smile|좋아, 목표 정했지? 바로 가자.~calm|일단 상황부터. 무턱대고 답을 고르지는 말고.
smile|이 배지? 작아도 태양은 잘 보이지?~happy|오늘 달리기는 이겼어. 어제의 나한테!
angry|내 얼굴에 답 없거든! 앞에 봐.~smile|{teacher} 선생님, 웃기만 하면 내가 봐줄 줄 알았어?
calm|지금 집중하는 거 알아. 나도 잠깐 조용히 할게.~smile|잘하고 있네. 말 걸려다가 참았다.
calm|같은 데서 망설이면 조건을 다시 확인하자.~smile|빠른 게 전부는 아니지. 맞는 쪽을 골라야 하니까.
happy|멈출 땐 확실하게! 어깨부터 풀어.~smile|물 마시러 가자. 돌아올 때까지 자리는 지켜 둘게.
smile|돌아왔네. 남긴 것부터 정리하자.~happy|좋아, 다시 해 볼 기운은 생겼지?
happy|끝! 오늘도 해냈네. 수고했어!~soft|{teacher} 선생님, 같이 끝내니까 더 좋다.
smile|짧게라도 움직였으니 됐어.~calm|다음에 할 일 하나만 정하고 가.
smile|레이는 확인부터 하재. 덕분에 놓친 걸 찾기도 해.~happy|츠무기랑 일하면 끝난 뒤가 깔끔해. 그건 내가 배워야지.
happy|매운 요리에 도전했는데 물을 너무 마셨어.~smile|뛰고 나서 먹는 간식이 제일 맛있더라.
soft|아까 사실 좀 떨렸어. 네 앞이라 티 안 냈지.~smile|막힐 때 네가 옆에 있으면 다시 해 볼 마음이 나.
calm|틀린 건 고치면 돼. 이유는 보고 넘어가자.~smile|방금은 판단 좋았어. 스스로도 기억해 둬.` ,
momo:`smile|왔구나! 선배가 특별히 자리를 남겨 줬지.~happy|{teacher} 선생님, 늦지 않았네. 칭찬해 줄게!
angry|선배보다 빨리 오면 내가 기다린 척도 못 하잖아!~smile|아직 시작 전이니까 내가 먼저 설명… 아, 책이 거꾸로네.
smile|오늘은 선배만 믿어! …범위부터 같이 정하자.~calm|익숙하다고 그냥 넘기지 마. 왜 그런지도 말해 봐.
angry|키 재지 마! 오늘 신발이 낮은 것뿐이야.~smile|토끼가 귀여워서 단 건 아니고… 어울리니까!
angry|나 보지 말고 앞에 봐! 선배가 두 번 말하게 하지 마.~smile|{teacher} 선생님, 방금 내 실수는 못 본 거야. 알겠지?
calm|지금 집중하는 거지? 그럼 선배도 얌전히 있어 줄게.~smile|내가 조용하니까 이상해? 원래 어른은 말이 적어.
calm|똑같아 보여도 조건이 다른 건지 확인해 봐.~angry|또 같은 줄 읽었어? …나도 방금 그랬지만!
happy|쉬자! 선배가 먼저 말했으니까 쉬는 거야.~smile|물컵은 내가… 앗! 안 쏟았어. 거의 안 쏟았어.
smile|다시 시작! 내가 어디까지 했는지 다 기억… 표시해 뒀지?~happy|이번엔 내가 먼저 준비했어. 진짜야!
happy|잘했어! 선배가 고른 선생님답네.~smile|{teacher} 선생님, 오늘은 내가 칭찬해 주는 날이야.
smile|짧아도 약속한 건 한 거지. 다음에도 와.~angry|벌써 가? …다음 범위는 정하고 가야지!
angry|츠무기가 또 내 리본을 묶어 줬어. 나도 할 수 있는데!~smile|세나는 내가 넘어질 뻔한 걸 못 봤대. 좋은 후배야.
smile|후드가 큰 건 일부러야. 이게 요즘 멋이라고.~angry|보드게임 설명서는 확인한 거야! 몰라서 읽은 게 아니고!
soft|내가 실수해도 웃고 기다려 주는 건… 고마워.~smile|너 앞에서는 선배 노릇 조금 못해도 되려나.
smile|이번엔 헷갈린 걸 알았잖아. 다음엔 이길 수 있어.~calm|빨리 외운 것과 제대로 아는 건 달라. 선배 말 들어.` ,
tsumugi:`smile|왔어? 네 쪽은 치워 놨어.~soft|{teacher} 선생님, 의자 흔들리던 건 고쳤어.
smile|벌써 왔네. 준비부터 같이 하자.~calm|시작 전에 연결할 곳부터 살펴보면 좋아.
calm|오늘 할 만큼만 꺼내자. 마무리할 시간도 남기고.~smile|처음부터 끝까지 어떻게 이어지는지 보자.
smile|소매 단추 풀렸네. 잠깐 줘 봐.~calm|이 매듭은 쉽게 안 풀려. 손으로 만져 봐도 돼.
smile|내 손 말고 네 앞을 봐. 고치는 건 내가 할게.~calm|{teacher} 선생님, 그렇게 보고 있으면 나도 조금 신경 쓰여.
calm|집중해. 옆에서 조용히 정리하고 있을게.~soft|잘 붙잡고 있네. 필요하면 말해.
calm|마무리까지 생각하자. 끝없이 붙들 순 없잖아.~smile|느슨한 부분만 다시 보면 돼. 전부 풀 필요는 없어.
smile|손부터 쉬자. 어깨도 내려 봐.~calm|잠깐 걸어오자. 돌아와서 마무리하면 돼.
smile|다시 왔네. 남긴 곳부터 맞춰 보자.~calm|아까 표시가 있어서 바로 찾겠어.
smile|마무리까지 됐네. 이제 정리하자.~soft|{teacher} 선생님, 오늘도 잘 버텼어. 쉬러 가자.
calm|짧게 했다면 정리도 짧게. 표시만 남겨.~smile|다음에 이어 붙이면 돼. 오늘 한 건 남아 있어.
smile|모모는 리본을 풀 때도 자기가 푼 거래. 알았다고 했어.~soft|미오가 내 몫까지 챙겨 줘서 오늘은 내가 먼저 챙기려고.
smile|선물 포장끈을 너무 튼튼하게 묶었나 봐.~calm|작은 모형은 완성하고 나서 천천히 보는 게 좋아.
soft|이건 네가 가져. 오래 쓰라고 튼튼하게 만들었어.~smile|네가 잘 쓰는 걸 보면 만든 보람이 있지.
calm|처음 연결이 틀렸으면 거기만 다시 잡으면 돼.~smile|이번 매듭은 단단하네. 다음도 해 보자.`
};
export const illustrationBanks=Object.fromEntries(Object.entries(raw).map(([id,text])=>{const bank=Object.fromEntries(text.trim().split('\n').map((row,i)=>[keys[i],parse(row.replaceAll('~','\n'))]));return [id,bank];}));

for(const [id,bank] of Object.entries(illustrationBanks)){bank.morning=illustrationRoutine[id].morning.map(text=>({text,expression:'smile'}));bank.night=illustrationRoutine[id].bed.map(text=>({text,expression:'sleepy'}));bank.return=bank.greeting;}
for(const [id,bank] of Object.entries(illustrationBanks)){
 for(const [group,lines] of Object.entries(illustrationExtras[id]))bank[group].push(...lines);
 bank.morning.push({text:illustrationRoutine[id].wake[0],expression:'soft'});
 bank.night.push({text:illustrationRoutine[id].sleep[0],expression:'sleepy'});
 bank.return=[...bank.resume];
}
