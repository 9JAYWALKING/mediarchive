import {illustrationRoutine} from './illustration-context.js?v=20261115akariRemake1';
import {illustrationExtras} from './illustration-dialogue-extra.js?v=20261115akariRemake1';
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
akari:`calm|왔네. 이쪽 자리 비워 뒀어.~smile|{teacher} 선생님, 오늘은 내가 먼저 왔어. 조금 뿌듯한데.~soft|응, 여기 있어. 가방 내려놓고 와.~smile|복도에서 네 발소리 들렸어. 맞혔네.
smile|벌써? 나 아직 머리도 못 정리했는데. 일단 앉아.~happy|먼저 해 보려고 온 거야? 좋아. 나도 궁금했어.
calm|책 펴자. 오늘은 어디까지 같이 볼까?~calm|시작하기 전에 끝낼 시간부터 정해 줘. 나도 기억할게.
smile|방울 안에 든 거? 내가 골랐어. 흔들면 잠깐 빨갛게 보이지.~calm|소리가 작아서 좋아. 가까이 있어야 들리거든.~smile|응? 불렀어?~smile|지금 내 앞머리 보고 있었지. 한 가닥만 자꾸 나와.~smile|손 차갑네. 컵 아직 따뜻해. 잡고 있어.
smile|나 말고 책. 내 얼굴엔 답 없어.~smile|또 이쪽 봤어. 세 번째야. 세고 있었냐고? 응.~smile|내가 궁금한 건 알겠는데, 방금 어디까지 봤어?~smile|딱 한 번만 눈 마주치고 다시 하자. 약속.
calm|아까부터 같은 데 보고 있네. 막힌 거 있어?~smile|나 구경은 잠깐 쉬고. 네가 보던 데, 거기부터.~smile|그렇게 보면 나도 보게 되잖아. 우리 둘 다 손 멈췄네.~calm|지금 좋다. 종이 넘기는 소리만 나네.~calm|멈춘 데 있어? 없으면 나는 조용히 있을게.
calm|어깨 올라갔어. 힘 좀 빼.~calm|계속 같은 데 보고 있네. 잠깐 멀리 볼래?
soft|잠깐 일어나자. 어깨가 아까부터 굳어 있었어.~soft|잠깐 쉬자. 창가 쪽 바닥이 따뜻하더라.~soft|컵 비었네. 물 받으러 같이 갈까?
smile|돌아왔네. 표시는 여기 해 뒀어.~smile|아까 막힌 데부터? 응, 나도 다시 보고 싶었어.
smile|여기까지 했네. 표시해 뒀으니까 이제 쉬자.~smile|끝. 오늘은 약속한 시간에 잘 멈췄네.~smile|덮어도 돼. 마지막 장까지 같이 봤잖아.~smile|잘했어. 이제 간식 고르는 건 내 차례.
calm|짧아도 하나는 알았네. 그거면 남은 거지.~calm|여기 접어 둘게. 다음에 이어 보자.
smile|레이랑 같은 데서 멈췄어. 서로 아무 말도 안 했는데.~smile|아오이는 돌아갈 길까지 정하더라. 난 그 길에 고양이 있는지가 궁금하고.~smile|츠무기가 방울 끈 고쳐 줬어. 소리도 조금 얌전해졌네.
calm|지우개 또 바닥에 갔어. 저쪽을 자기 자리로 정했나 봐.~smile|이 컵은 왠지 화요일 같아. 이유? 그냥 화요일처럼 생겼는데.~calm|창가 고양이 이름 정했어. 단추. 네 겉옷 단추랑 눈이 닮아서.~happy|저기, 봤어? 고양이가 자기 꼬리 놓쳤어. 한 번 더 하나 보자.~smile|오늘 간식은 두 개. 나누려고 산 거 맞아.~smile|의자가 조금 삐걱거려. 내가 움직이면 대답하는 것 같아.~smile|비 오는 날엔 창문 쪽 소리가 좋아.~smile|고양이 사진 볼래? 한 장만. 사실 세 장이야.~smile|이 빨간 탭은 찾기 쉬워서 달았어. 귀엽기도 하고.
calm|같이 있어도 조용해서 좋네.~smile|이거 네가 좋아할 것 같아서 가져왔어. 맞아?~soft|오늘 얘기하려고 기억해 둔 게 있어. 잠깐 앉아 봐.~smile|응, 나도 방금 좀 잘한 것 같아.~soft|그런 건 갑자기 말하면 좀. 한 번만 다시 말해 봐.~happy|맞혔어? 아, 좋다. 방금 건 진짜 궁금했거든.~soft|{teacher} 선생님, 옆에 있어 줘. 오늘은 그냥 그게 좋아.~soft|네가 웃으면 이유를 확인하고 싶어져. 나도 웃게 되니까.
soft|오늘 잘 안 풀리네. 작게 하나만 해 보자.~calm|모르면 표시해 둬. 아는 척하면 나중에 못 찾잖아.~smile|처음보다 덜 멈추네. 너도 느껴져?~smile|맞혔네. 방금은 찍은 얼굴 아니었어.~smile|헷갈린 데 찾았으면 앞으로 온 거야. 조금이지만.~smile|응, 이번 설명은 나도 따라갈 수 있겠어.`,
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
