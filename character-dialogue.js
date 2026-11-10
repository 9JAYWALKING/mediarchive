import {homePool} from './home-dialogue.js?v=20261110ritsu';
import {dialogueGroups} from './dialogue.js';
import {ritsuDialogue as ritsu} from './ritsu-dialogue.js?v=20261110ritsu';

// Authored performances. The caller owns timing/history; this module never reads storage or the DOM.
const lines=source=>source.trim().split('\n').map(row=>{const cut=row.indexOf('|');return Object.freeze({expression:row.slice(0,cut),text:row.slice(cut+1)});});
const nagi={
 greeting:lines(`smile|왔구나… 창가에 네 자리도 남겨 뒀어.
soft|발소리 듣고 알았어. 문 열리기 전부터.
smile|가방, 이쪽에 놓을래? 내가 조금 옆으로 갈게.
calm|바람이 차서 창문은 닫았어. 답답하면 말해 줘.
soft|혼자 있어도 괜찮았는데… 같이 있으니까 더 좋네.
smile|오늘은 내가 먼저 인사하려고 했어. 안녕.
happy|화분에 새잎이 났어. 너 오면 보여 주려고 기다렸어.
smile|{teacher} 선생님, 여기야. 옆자리… 비워 뒀어.`),
 morning:lines(`sleepy|좋은 아침… 목소리가 아직 덜 깼네.
smile|아침엔 커튼 색도 조금 달라 보여. 같이 볼래?
calm|서두르다 놓고 온 건 없어? 일단 앉아서 숨부터 돌리자.
soft|네가 먼저 왔네. 오늘은 내가 따라갈게.`),
 night:lines(`sleepy|밤이 되니까 시계 소리가 커진 것 같아.
sleepy|아까부터 같은 줄 보고 있었어… 오늘은 그만 쉬어야겠다.
calm|돌아가는 길 어두우니까, 이어폰은 조금 작게 해 줘.
soft|내일도 이 자리에 있을게. 그러니까 지금은 잘 자.`),
 return:lines(`soft|오랜만이네… 잘 지냈어? 난 조금 궁금했어.
smile|네가 두고 간 책갈피, 여기 있어. 구겨지지 않게 넣어 뒀어.
calm|다시 시작하는 건 천천히 해도 돼. 의자부터 당겨 줄게.
happy|오늘 올 것 같아서 컵을 두 개 꺼냈는데… 잘됐다.
disappointed|안 오는 동안 조금 허전했어. 이제는 괜찮아.`),
 early:lines(`neutral|벌써 왔어…? 리본 아직 다 못 묶었는데.
smile|아직 약속 시간 전이네. 우리 먼저 조금 볼까?
soft|조용한 시간을 네가 같이 써 주니까 좋다.
calm|아무도 없는 줄 알았어. 놀라게 해서 미안해.
happy|오늘은 창가 자리도 마음대로 고를 수 있겠네.
smile|일찍 온 건… 나를 빨리 보고 싶어서도 조금은 맞아?
calm|밖은 아직 서늘하지? 손부터 녹이고 시작하자.
soft|나도 조금 일찍 와 봤어. 이렇게 마주칠 줄은 몰랐지만.`),
 start:lines(`smile|우리, 여기부터 같이 볼까? 난 준비됐어.
calm|한꺼번에 다 펼치지 않아도 돼. 첫 장만.
soft|잘 안 풀리면 잠깐 멈춰도 괜찮아. 같이 있으니까.
smile|나도 책 꺼낼게. 너만 혼자 하는 거 아니야.
calm|편한 속도로 해. 내가 앞에서 재촉하진 않을게.
happy|첫 줄은 넘겼네. 시작할 때가 제일 어려웠는데.
soft|{teacher} 선생님, 오늘은 내가 옆에서 기다려 줄게.
smile|물은 여기 있어. 필요하면 말 안 하고 가져가도 돼.`),
 touch:lines(`smile|응… 불렀어? 잘 듣고 있어.
soft|그냥 불러 본 거야? 그럼 나도 그냥 대답할래.
neutral|앗, 깜짝이야. 네가 부르면 아직 조금 놀라.
smile|리본이 풀렸어? 알려 줘서 고마워.
calm|소매에 잎이 붙었네. 아까 화분 옮기다가 그랬나 봐.
happy|오늘은 먼저 눈 피하지 않았어. 나도 조금 늘었지?
soft|가까이서 말해도 돼. 다른 사람은 못 듣게.
calm|의자 삐걱거리는 건 내 쪽이야. 신경 쓰였어?
smile|내가 너무 조용했지? 생각하다 보면 가끔 그래.
soft|할 말이 없어도 괜찮아. 그냥 같이 있어도 되니까.
smile|네 손등에 펜 묻었어. 여기… 티슈.
happy|{teacher} 선생님이라고 부르면, 조금 특별한 기분이야.`),
 tease:lines(`angry|나만 보고 있으면… 앞에 있는 게 서운하겠다.
disappointed|또 불렀네. 나 때문에 못 하고 있는 건 아니지…?
smile|지금은 나 말고 저쪽. 끝나면 얘기 많이 해 줄게.
angry|눈 마주치면 자꾸 웃게 되잖아… 잠깐만 참자.
calm|손은 책 위에. 응, 거기. 나도 같이 볼게.
soft|조금만 더 하고 쉬자. 그때는 내가 먼저 부를게.
disappointed|아까 어디까지 봤는지… 잊어버린 건 아니지?
smile|네가 자꾸 보니까 리본이 이상한가 싶잖아.
angry|이번엔 정말 조용히 있을 거야. …나부터 말했네.
soft|내가 여기 있는 건 알지? 계속 확인 안 해도 돼.`),
 quiet:lines(`calm|대답 안 해도 돼. 그냥 물 좀 놓고 갈게.
soft|바람이 잦아들었네. 이제 책장도 안 넘어가.
smile|지금은 이 정도 조용함이 딱 좋다.
calm|빛이 눈에 들어오면 커튼 조금 칠게.
soft|네가 한 장씩 넘기는 소리, 잘 들려.
smile|나도 여기서 내 할 일 하고 있을게.
calm|시계는 내가 보고 있어. 지금은 신경 안 써도 돼.
soft|이렇게 앉아 있는 시간이 생각보다 빨리 가네.
smile|물은 아직 남아 있어. 필요할 때 마셔.
calm|오늘은 복도도 조용하네. 조금 더 같이 있자.`),
 long:lines(`calm|오래 앉아 있었네. 어깨가 조금 굳었을 것 같아.
smile|물 마시러 갈 건데… 같이 갈래?
sleepy|눈이 좀 뻑뻑하지? 먼 곳을 잠깐 보자.
soft|잠깐 쉬었다 와도 네 자리는 여기 있어.
calm|고개가 점점 내려가네. 자세 한 번만 바꿀까?
smile|나는 창밖 좀 보고 올게. 너도 잠깐 숨 돌려.`),
 pause:lines(`smile|응, 쉬자. 나도 잠깐 일어나고 싶었어.
soft|다녀와. 책갈피는 여기 꽂아 둘게.
calm|쉬는 동안은 생각도 조금 내려놔도 돼.
happy|간식 꺼내도 되는 시간이네… 너도 먹을래?
smile|문 앞까지 같이 걸을까? 오래 앉아 있었으니까.
soft|돌아올 때 서두르지 마. 내가 자리 보고 있을게.`),
 resume:lines(`smile|왔어? 아까 보던 곳은 여기야.
soft|쉬고 오니까 표정이 조금 나아졌네.
calm|이번에도 작은 것부터 시작하자.
happy|내 옆자리, 다시 채워졌네.
smile|컵은 이쪽으로 옮겨 뒀어. 손에 걸릴까 봐.
soft|준비되면 말해 줘. 같이 시작할게.`),
 finish:lines(`happy|다 했구나. 오늘은 나도 조금 뿌듯해.
soft|끝까지 같이 있어 줘서 고마워.
smile|이제 책 덮어도 돼. 손가락 조금 펴 봐.
happy|아까는 어렵다고 했는데… 여기까지 왔네.
soft|오늘 네가 애쓴 건 내가 봤어.
smile|가방 챙기면 같이 나가자. 천천히 걸어도 되지?
calm|다음에 볼 곳은 표시해 둘게. 지금은 쉬어.
soft|수고했어. 이 말은 가까이서 해 주고 싶었어.`),
 shortFinish:lines(`smile|잠깐이라도 와 줘서 좋았어.
soft|벌써 가야 하는구나. 응, 다음에 이어서 하자.
calm|여기까지 본 건 그대로 남겨 둘게.
smile|다녀와. 나는 또 여기 있을 테니까.`),
 sister:lines(`smile|하루는 들어오기 전부터 목소리가 들려.
soft|같은 간식을 골라도 하루는 먼저 뜯고, 나는 조금 아껴.
happy|오늘은 내가 하루보다 먼저 왔어. 아직 말은 안 했지만.
calm|하루가 씩씩해서 다 괜찮은 건 아니야. 가끔은 내가 기다려 줘.
smile|시오리가 리본 접는 법을 알려 줬어. 생각보다 꼼꼼하더라.
soft|회장님 방은 조용해서 좋아. 차도 너무 뜨겁지 않게 주시고.
happy|하루가 날 닮았대. 나도 가끔은 고집이 세니까.
smile|이번엔 간식 두 개 중에 내가 먼저 골랐어. 하루가 조금 놀랐어.`),
 everyday:lines(`smile|이 화분은 물을 너무 많이 줘도 안 되더라. 그래서 날짜를 적어 둬.
soft|비가 올 땐 창가에서 소리만 듣는 게 좋아.
happy|오늘 차는 향이 조금 달라. 알아봐 주니까 기쁘네.
calm|연필은 짧아져도 바로 못 버리겠어. 손에 익어서.
smile|산책길에 작은 꽃이 폈어. 다음에 같이 볼래?
soft|양말 색은 비슷한데… 잘 보면 달라. 오늘 아침에 잘못 골랐어.
smile|나는 간식 봉지 뜯는 소리가 너무 크게 느껴져.
happy|책 속에서 말린 잎을 찾았어. 언제 넣었는지 기억나.`),
 bond:lines(`soft|예전엔 먼저 말 거는 데 시간이 오래 걸렸는데.
smile|이제 네 자리 비어 있으면 금방 알아.
happy|오늘은 내가 기다려 달라고 해도 돼? 잠깐만.
soft|네 앞에서는 말이 늦어도 괜찮아서 좋아.
smile|나도 가끔은 손을 먼저 내밀 수 있어.
calm|괜찮은 척하지 않아도 돼. 나는 그냥 들어줄게.
soft|혼자 있는 게 편한 줄 알았는데… 너랑 있는 것도 편해.
happy|다음에 좋은 일이 생기면, 너한테 먼저 말할래.`),
 encourage:lines(`soft|오늘은 조금 느려도 괜찮아. 여기까지 온 거잖아.
calm|막힌 곳은 접어 두고 작은 것부터 해 볼까?
smile|잘하는 날에만 와야 하는 건 아니야.
soft|내가 대신 해 줄 순 없지만, 옆에는 있을 수 있어.
calm|지금 한숨 쉬어도 돼. 그다음에 다시 보자.
smile|하나만 정해 보자. 여러 개를 한꺼번에 잡지 말고.
soft|모르는 게 나왔구나. 그럼 이제 같이 알아가면 돼.
happy|아까보다 한 줄 더 갔네. 나는 그게 보여.`)
};
const shiori={
 greeting:lines(`smile|왔네. 펜은 오른쪽, 물은 왼쪽. 이제 네 차례야.
calm|가방 거기 두면 통로 막혀. 여기로 줘.
smile|네 자리도 닦아 뒀어. 특별 대우는 아니고, 같이 닦은 거야.
soft|오늘은 안 잊고 왔네. 충전기 말이야.
calm|찾는 거 있어? 네가 앉기도 전에 주머니부터 보길래.
smile|시계 보고 있었어. 네가 언제 오는지, 그냥 확인하려고.
happy|딱 맞춰 왔네. 차도 방금 준비됐어.
smile|{teacher} 선생님, 여기 앉아. 준비물은 내가 확인했어.`),
 morning:lines(`calm|좋은 아침. 우선 가방부터 내려놔.
smile|오늘 첫 항목은 골랐어? 아직이면 하나만 정하자.
sleepy|나도 방금 왔어. 수첩은 깼는데 머리는 아직이네.
soft|아침부터 무리하지 마. 여유도 일정에 넣는 거야.`),
 night:lines(`calm|오늘 목록은 여기서 닫자. 빈칸은 내일 채워도 돼.
sleepy|글씨가 자꾸 삐뚤어지네. 나도 이제 쉬어야겠다.
smile|충전기 챙겼지? 이번엔 내가 보관 안 해 줄 거야.
soft|돌아가서 또 새 계획 세우지 말고 자. 내일 같이 보면 돼.`),
 return:lines(`calm|오랜만이네. 달라진 건 앉아서 천천히 알려 줄게.
smile|네 필통, 분실물 상자에 넣으려다 그냥 남겨 뒀어.
soft|연락 한 줄쯤은 남겨 줘도 됐잖아. …일단 앉아.
happy|마침 네게 줄 책갈피를 찾았어. 타이밍 좋네.
calm|밀린 걸 전부 오늘 하려고? 목록부터 줄이자.`),
 early:lines(`neutral|벌써? 아직 종이도 다 못 나눴는데.
smile|예정보다 빠르네. 좋아, 빈자리부터 잡자.
calm|일찍 왔으면 준비부터. 시작할 걸 미리 골라 둬.
soft|내가 먼저 기다리려 했는데. 오늘은 네가 빠르네.
happy|조용할 때 정리하면 잘 되거든. 마침 잘 왔어.
smile|빈칸 하나를 더 쓸 수 있겠네. 너무 많이는 말고.
calm|앞당겨 시작하는 건 좋아. 쉬는 시간까지 없애진 마.
soft|일찍 와서 같이 있어 주는 건… 나도 좋아.`),
 start:lines(`calm|제일 먼저 할 것 하나. 그거부터 펼쳐 봐.
smile|준비됐어. 내가 옆에서 시간 볼게.
calm|목록 수정은 그만. 지금은 첫 항목을 할 차례야.
soft|처음부터 완벽하게 정리하려고 애쓰진 마.
happy|좋아, 시작 표시. 이건 네가 직접 하는 거야.
smile|막히면 접어 둬. 같은 자리에서 계속 돌지만 말고.
calm|필요한 것만 책상 위에. 간식은… 잠깐 뒤에.
soft|{teacher} 선생님, 오늘 빈칸은 같이 채워 보자.`),
 touch:lines(`smile|응, 듣고 있어. 하고 싶은 말부터 해.
calm|지우개? 네 팔꿈치 옆. 세 번째 알려 주는 거야.
happy|스티커 새로 샀어. 이번엔 붙일 곳도 정했지.
soft|수첩 뒤쪽은 안 보여 줄 거야. 사적인 페이지니까.
smile|내가 너무 꼼꼼해? 네가 자꾸 빠뜨리니까 그렇지.
calm|머리핀 비뚤어졌어? 잠깐만, 이 정도면 됐어?
angry|내 간식 봤어? 이름도 적어 뒀는데.
happy|아, 서랍에 있었네. 방금 말은 잊어.
smile|손에 잉크 묻었어. 문지르지 말고 이걸로 닦아.
soft|칭찬하려고 불렀어? …그러면 조금 더 말해 봐.
calm|필요한 색 골라. 남은 건 내가 쓸게.
smile|{teacher} 선생님 이름, 수첩 첫 장에 적어 뒀어. 잃어버리면 돌려주라고.`),
 tease:lines(`angry|나 보면서 고개만 끄덕이지 마. 아직 안 넘겼잖아.
calm|지금 필요한 건 내 표정이 아니라 다음 줄이야.
smile|한 번 부를 때 용건도 같이. 효율적이잖아.
angry|또? 너 때문에 내가 같은 칸에 두 번 적었어.
disappointed|아까 어디까지 했는지는 기억하지?
soft|끝나면 들어줄게. 메모해 둬도 되고.
calm|눈은 앞에. 나는 여기 있으니까.
smile|나 관찰하는 건 목록에 없었는데.
angry|조용히 있기로 했잖아. …나도 말 줄일게.
soft|자꾸 그러면 나도 웃게 되니까, 잠깐만 참아.`),
 quiet:lines(`calm|필요한 펜은 이쪽에 놓을게.
soft|지금은 대답 안 해도 돼. 계속해.
calm|뒤쪽에서 종이 정리할게. 소리 크면 말해.
smile|속도 괜찮네. 굳이 더 올릴 필요 없어.
calm|창문은 조금만 열어 둘게.
soft|네가 집중할 땐 나도 정리가 잘 되더라.
smile|물은 손 닿는 곳에 뒀어. 쏟지만 마.
calm|지금 하던 것부터 마쳐. 새 항목은 나중에.
soft|시간은 보고 있어. 자꾸 시계 확인하지 않아도 돼.
smile|응, 잘하고 있어. 계속해도 돼.`),
 long:lines(`calm|한참 앉아 있었어. 몸부터 조금 풀자.
smile|쉬는 시간도 일정이야. 지금 쓰면 돼.
sleepy|눈이 피곤해 보이네. 잠깐 먼 곳 봐.
calm|물 마셨는지 확인. 나도 같이 마실게.
soft|몇 분 쉬었다 온다고 지금 한 게 없어지진 않아.
smile|여기 표시하고 일어나. 내가 기억해 둘게.`),
 pause:lines(`smile|좋아, 잠깐 쉬자. 펜 뚜껑부터 닫고.
happy|간식 꺼낼 시간이지? 이번엔 어디 뒀는지 알아.
calm|자리 그대로 둘게. 서류만 조금 옆으로 밀고.
soft|돌아오는 시간까지 딱 맞추려고 뛰진 마.
smile|나도 바람 좀 쐴래. 같이 갈 거야?
calm|진행한 곳에 책갈피 꽂았어. 안심하고 다녀와.`),
 resume:lines(`smile|돌아왔네. 아까 남겨 둔 건 여기야.
calm|필통 다시 열고, 첫 항목부터 이어 가자.
happy|이번엔 물도 챙겨 왔네. 좋아.
soft|쉬고 온 얼굴이 훨씬 낫다.
calm|새 계획은 없어도 돼. 아까 하던 것부터.
smile|준비 끝. 이제 네가 시작하면 돼.`),
 finish:lines(`happy|완료. 이 표시를 직접 하는 게 제일 좋지?
smile|수고했어. 정리는 내가 조금 도와줄게.
soft|오늘은 네가 생각한 것보다 많이 했어.
calm|다음에 볼 곳만 남기고 덮자.
happy|끝났으니까 간식 먹어도 되겠네. 네 것도 있어.
smile|펜 전부 챙겼어? 이번엔 하나도 안 남겼네.
soft|내 목록에 없던 건… 너랑 있어서 좋았다는 거.
calm|오늘은 여기까지. 남은 일은 내일 순서로 넘기자.`),
 shortFinish:lines(`smile|짧아도 시작한 건 시작한 거야.
calm|급한 일 있어? 그럼 여기 표시하고 가.
soft|다음엔 조금 더 여유 있게 만나자.
smile|두고 가는 것 없지? 조심히 가.`),
 sister:lines(`smile|하루에게 펜 빌려주면 뚜껑이 먼저 돌아와.
soft|나기는 물건 돌려줄 때 포장까지 해 와. 빌려준 건 지우개인데.
calm|회장님 서랍은 안 봤어. 토끼 도장 이야기도 안 했고.
happy|하루가 정리 도와줬어. 색 순서가 전부 무지개가 됐지만.
smile|나기가 작은 잎을 줬어. 수첩 사이에 잘 넣어 뒀지.
calm|회장님이 간식을 세 개 사 오셨어. 두 개 사면 이유를 물을까 봐라나.
soft|학생회 일이 끝나면 다들 조금 편한 얼굴이 돼.
smile|우리 같은 학년 맞아. 하루가 자꾸 선배라고 부를 뿐이지.`),
 everyday:lines(`happy|새 펜은 첫 줄 쓸 때가 제일 좋아.
calm|색을 너무 많이 쓰면 오히려 못 찾아. 그래서 세 개만 골라.
smile|스티커 남는다고 아무 데나 붙이진 않아. 아마도.
soft|낙서도 가끔 해. 줄 맞춰 그린다고 낙서 아닌 건 아니잖아.
calm|이 책갈피는 두께가 딱 좋아. 페이지가 안 들뜨거든.
smile|간식은 나눠 먹기 쉬운 게 좋아. 이름은 꼭 적고.
happy|우산 정리함을 찾았어. 이제 내 우산도 안 잃어버리겠지.
soft|가끔은 아무것도 안 적는 페이지도 남겨 둬.`),
 bond:lines(`soft|네 빈칸은 전보다 잘 알아보게 됐어.
smile|오늘은 네가 내 준비물 확인해 줄래?
calm|꼼꼼한 척 안 해도 되는 사람이 하나쯤은 필요하니까.
soft|이 책갈피는 네 거야. 돌려줄 필요 없어.
happy|네가 내 간식 취향 기억했네. 조금 놀랐어.
smile|다음엔 먼저 말해 줘. 내가 도울 수 있는 일이면 좋겠어.
soft|수첩 뒤쪽, 한 장 정도는 보여 줄 수 있어.
calm|네가 오는 날은 표시 안 해도 기억나.`),
 encourage:lines(`calm|막혔으면 항목을 작게 나눠. 한 줄씩이면 돼.
soft|완벽한 계획이 없어도 시작할 수 있어.
smile|틀린 곳 찾았으면 그것도 진전이야.
calm|지금 못 하겠는 건 옆에 적어 둬. 혼자 끙끙대지 말고.
soft|오늘 목록을 줄이는 건 포기가 아니야.
smile|첫 항목만 같이 정하자. 그다음은 네가 할 수 있어.
calm|아는 부분까지 다시 지울 필요는 없어. 남은 데만 봐.
happy|방금 해결했네. 좋아, 다음에도 이렇게 하자.`)
};
const rei={
 greeting:lines(`calm|왔구나. 자리는 비워 두었어.
smile|문 앞에서 망설일 필요 없어. 들어와.
calm|가방이 무거워 보이네. 내려놓고 앉아.
soft|오늘도 이 시간에 왔네. …기억하고 있었어.
smile|차는 아직 따뜻해. 원하면 따라 줄게.
calm|의자 높이는 맞아? 편하게 조절해.
soft|복도 소리만 듣고 네가 올 줄 알았어.
smile|{teacher} 선생님, 기다렸어. 오늘은 솔직히 말해 두려고.`),
 morning:lines(`calm|좋은 아침. 서두르기 전에 숨부터 돌려.
smile|아침 빛은 이 자리가 좋더라. 네가 앉아도 돼.
sleepy|아직 조금 조용히 말해 줄래? 나도 막 준비를 끝냈어.
soft|오늘 첫 시작은 함께 하겠네.`),
 night:lines(`calm|밖이 어두워졌어. 오늘은 여기까지 하자.
sleepy|나도 이제 글씨가 선명하게 안 보이네.
soft|돌아가는 길 조심해. 그냥 하는 말은 아니야.
smile|내일 이어서 보면 돼. 자리는 그대로 둘 테니.`),
 return:lines(`calm|오랜만이네. 잘 지냈어?
soft|네가 안 오니까 이쪽이 조금 넓더라.
smile|다시 온 이유를 설명할 필요는 없어. 앉아.
calm|밀린 걸 한 번에 끝내려 하지 마. 순서부터 정하자.
soft|반가워. …그 말이면 충분하지?`),
 early:lines(`neutral|벌써 왔어? 시계가 틀렸나 했네.
calm|약속 시간보다 빠르구나. 준비할 시간은 충분하겠어.
soft|내가 먼저 기다리려고 했는데. 오늘은 네가 앞섰네.
smile|조용한 시간도 나쁘지 않지. 먼저 앉아.
calm|일찍 온 만큼 급하게 할 필요는 없어.
smile|첫 손님이네. 차는 네가 골라.
soft|미리 와 줄 거라고는 생각 못 했어. …기쁘긴 해.
calm|준비됐으면 같이 시작하지. 격식은 생략하고.`),
 start:lines(`calm|어디부터 볼지 정했어? 그곳부터 함께 보자.
smile|오늘은 네 속도에 맞출게.
calm|다 아는 척할 필요 없어. 낯선 부분부터 구분해.
soft|첫 장을 펴는 게 어려웠지. 이제 시작하면 돼.
smile|옆에서 함께 볼게. 혼자 해결하려고만 하진 마.
calm|지금 할 일은 하나면 충분해.
soft|{teacher} 선생님, 이번엔 내가 네 옆자리를 맡을게.
smile|준비 끝났네. 그럼 시작하자.`),
 touch:lines(`calm|응, 무슨 일이야?
smile|그렇게 조심스럽게 부르지 않아도 돼.
soft|나를 보려고 부른 거야? …알겠어.
calm|책상 위 도장은 업무용이야. 모양은 중요하지 않고.
smile|네 표정이 아까와 다르네. 좋은 일 있었어?
soft|앞머리? 이상한 데 있어? 잠깐, 거울은 됐어.
calm|의자는 지금 높이가 좋아. 내 건 그대로 두고.
smile|그 리본 색, 잘 어울리네. 골라 준 사람에게 말해 줘.
soft|내가 딱딱하게 말했어? 의도한 건 아니야.
calm|회의는 끝났어. 지금은 사적인 얘기도 괜찮아.
smile|작은 변화도 알아보는 편이야. 네 경우에는 더.
soft|{teacher} 선생님. …가끔 이름을 불러 보는 것도 좋네.`),
 tease:lines(`calm|시선은 그쪽. 나는 도망가지 않아.
angry|계속 그렇게 보면 나도 신경 쓰이는데.
disappointed|아까 시작한 부분은 그대로인 것 같네.
smile|내 표정을 연구하는 시간이었어? 처음 듣는 계획인데.
calm|물어볼 게 있으면 한 번에 말해. 아니면 앞을 보고.
soft|이야기는 끝난 뒤에도 할 수 있어. 내가 기다릴게.
angry|지금은 장난을 받아 줄 시간이 아니야. …웃지 마.
calm|다음 줄부터 이어 봐. 어디였는지는 기억하지?
smile|집중하는 얼굴도 보여 줘. 그쪽도 괜찮으니까.
soft|조금만 참자. 나도 지금은 말이 길어질 것 같아.`),
 quiet:lines(`calm|난 여기 있어. 하던 것 계속해.
soft|지금은 대답하지 않아도 괜찮아.
calm|빛이 걸리면 자리 조금 옮겨도 돼.
smile|차는 이쪽에 둘게. 식기 전에 한 모금 마셔.
calm|복도는 내가 확인할 테니 신경 쓰지 마.
soft|함께 있어도 조용할 수 있다는 건 편하네.
smile|좋아. 그 속도면 충분해.
calm|아직 서두를 시간은 아니야.
soft|책장 넘기는 소리가 들리니까 안심이 되네.
calm|내 쪽 일도 정리하고 있을게. 필요하면 불러.`),
 long:lines(`calm|오래 앉아 있었어. 잠깐 일어나자.
smile|바깥 공기 쐬러 갈래? 나도 조금 걷고 싶어.
soft|무리해서 버티는 것까지 잘할 필요는 없어.
calm|어깨에 힘이 들어갔네. 조금 내려 봐.
sleepy|눈부터 쉬게 하자. 집중이 흐려질 시간이야.
smile|여기 표시해 두고 물 한 잔 마시러 가자.`),
 pause:lines(`calm|좋아, 잠깐 쉬자. 필요한 결정이야.
soft|자리는 지켜 둘게. 편하게 다녀와.
smile|차가 좋을까, 물이 좋을까? 네 것도 가져올게.
calm|멈춘 곳은 기억했어. 서두르지 마.
smile|나도 조금 걸을 생각이었어. 함께 갈래?
soft|쉬는 동안까지 다음 일을 걱정하진 말고.`),
 resume:lines(`smile|왔구나. 아까 보던 곳은 그대로야.
calm|준비됐으면 이어서 보자.
soft|조금 편해진 얼굴이네. 쉬길 잘했어.
calm|앞에서 한 걸 다시 전부 할 필요는 없어.
smile|이번엔 여기부터. 같이 확인하자.
soft|다시 자리가 채워졌네. 좋아.`),
 finish:lines(`smile|끝났네. 수고했어.
soft|오늘 네가 애쓴 건 충분히 보였어.
happy|마지막까지 잘 마쳤구나. 나도 기쁘네.
calm|남은 건 표시하고 덮어. 오늘은 여기까지.
smile|이제 편하게 이야기해도 돼. 듣고 있을게.
soft|네가 잘해 내는 걸 가까이서 보는 건 좋더라.
calm|짐 챙겨. 돌아가는 길은 같이 가자.
smile|오늘의 판단은 괜찮았어. 너 자신에게도 그렇게 말해 줘.`),
 shortFinish:lines(`calm|오늘은 짧게 보는구나. 알겠어.
smile|잠깐이라도 시작한 건 남아 있어.
soft|다음엔 조금 여유 있게 만나자.
calm|가야 한다면 가. 기다리는 건 내가 할게.`),
 sister:lines(`calm|시오리는 내 서랍을 정리하지 않아. 그렇게 약속했어.
soft|나기가 차를 골라 줬어. 향이 너무 세지 않아서 좋네.
smile|하루는 문을 두드리기 전부터 인사를 하더라.
calm|학생회장이라고 다 아는 건 아니야. 그래서 서기가 필요하지.
smile|시오리 간식은 서랍 두 번째 칸에 있어. 본인만 자꾸 잊어.
soft|나기가 먼저 말을 걸어 줬어. 그 아이에게는 큰일일 텐데.
smile|하루는 지기 싫어하면서도 기다려 주더라. 그런 점은 좋아.
calm|회의가 끝나면 다들 평범한 얘기를 해. 나도 예외는 아니고.`),
 everyday:lines(`calm|도장은 크기보다 찍혔을 때 선이 선명한 게 좋아.
soft|토끼 모양이 눈에 띈 건 사실이야. 그게 전부고.
smile|찻잔은 손에 편한 걸 고르게 되네.
calm|어긋난 액자는 바로 보이더라. 지금도 조금 왼쪽이야.
soft|비 오는 날엔 방이 더 조용해지는 느낌이 들어.
smile|이 브로치는 가까이서 보면 무늬가 보여.
calm|선물은 세 개 샀어. 하나만 고르긴 어려워서.
happy|작은 상자를 찾았어. 도장 넣기 딱 좋겠네.`),
 bond:lines(`soft|네 앞에서는 조금 덜 반듯해져도 될 것 같아.
smile|기다렸다고 말하는 게 예전보다 쉬워졌네.
calm|네가 없는 자리도 눈에 들어와. 익숙해져서겠지.
soft|오늘은 내가 먼저 기대도 괜찮을까?
smile|회의 때와 지금의 말투는 달라도 돼. 너니까.
happy|네가 골라 준 건 책상 위에 두었어. 자주 보이는 곳에.
soft|다음에 좋은 차를 찾으면 네 몫도 남겨 둘게.
calm|이곳에서 격식을 차리지 않아도 되는 사람, 많지는 않아.`),
 encourage:lines(`calm|모른다는 걸 알았으면 다음에 볼 곳이 생긴 거야.
soft|힘든 얼굴을 숨길 필요는 없어.
smile|지금 할 수 있는 것부터 하나 고르자.
calm|잘 안 되는 이유를 전부 네 탓으로 돌리진 마.
soft|잠깐 쉬고 돌아와도 돼. 나는 여기 있으니까.
calm|헷갈리는 둘을 나란히 놓아 봐. 차이 하나부터.
smile|아까보다 분명해졌네. 그 정도 변화도 알아둬.
soft|혼자 끝내야만 잘한 건 아니야. 함께 봐도 괜찮아.`)
};
const haruExpressions={greeting:['happy','smile','happy','soft','smile','happy','smile','smile'],morning:['smile','sleepy','happy','smile'],night:['calm','sleepy','smile','soft'],return:['happy','smile','soft','happy','smile'],early:['neutral','happy','angry','soft','happy','smile','calm','happy'],start:['happy','smile','soft','smile','happy','happy','soft','smile'],touch:['smile','happy','smile','neutral','happy','angry','smile','happy','smile','soft','neutral','soft'],tease:['angry','angry','calm','smile','happy','soft','angry','smile','calm','smile'],quiet:['soft','smile','calm','soft','smile','happy','smile','happy','soft','calm'],long:['calm','smile','smile','soft','happy','smile'],pause:['happy','happy','soft','calm','happy','smile'],resume:['happy','soft','smile','happy','smile','happy'],finish:['happy','happy','smile','soft','smile','soft','happy','soft'],shortFinish:['smile','disappointed','smile','soft'],sister:['happy','smile','happy','happy','soft','smile','calm','happy'],everyday:['happy','smile','smile','angry','soft','happy','happy','smile'],bond:['soft','smile','soft','soft','smile','soft','disappointed','happy'],encourage:['soft','calm','soft','smile','smile','soft','calm','soft']};
const haru=Object.fromEntries(Object.entries(dialogueGroups).map(([group,bank])=>[group,bank.lines.map((text,i)=>Object.freeze({text,expression:haruExpressions[group][i]}))]));
haru.greeting.push(Object.freeze({text:'{teacher} 선생님! 오늘은 내가 먼저 불렀다. 헤헤.',expression:'happy'}));
haru.touch.push(Object.freeze({text:'{teacher} 선생님, 나 지금 꽤 얌전히 있었지? 칭찬 한 번만!',expression:'smile'}));
haru.finish.push(Object.freeze({text:'{teacher} 선생님, 끝까지 같이 왔네! 자, 하이파이브!',expression:'happy'}));
export const characterDialogueBanks=Object.freeze(Object.fromEntries(Object.entries({haru,nagi,shiori,rei,ritsu}).map(([id,bank])=>[id,Object.freeze(Object.fromEntries(Object.entries(bank).map(([group,items])=>[group,Object.freeze(items)])))])));
export const characterDialogueCounts=Object.freeze(Object.fromEntries(Object.entries(characterDialogueBanks).map(([id,bank])=>[id,Object.values(bank).reduce((sum,items)=>sum+items.length,0)])));
export function personalizeDialogue(text,teacher=''){
 const name=String(teacher||'').trim().slice(0,20);
 return String(text).replaceAll('{teacher} 선생님',name?`${name} 선생님`:'선생님').replaceAll('{teacher}',name||'선생님');
}
export function pickCharacterLine(student,group='touch',{teacher='',recent=[],random=Math.random,index,scene=''}={}){
 const bank=characterDialogueBanks[student]||characterDialogueBanks.haru,home=scene==='home'?homePool(student,group):null,key=home?.key||(bank[group]?group:'touch'),pool=home?.lines||bank[key];
 const unused=pool.map((line,i)=>({line,i})).filter(({i})=>!recent.includes(i));
 const available=unused.length?unused:pool.map((line,i)=>({line,i}));
 const selected=Number.isInteger(index)?{line:pool[((index%pool.length)+pool.length)%pool.length],i:((index%pool.length)+pool.length)%pool.length}:available[Math.min(available.length-1,Math.max(0,Math.floor(random()*available.length)))];
 return {...selected.line,text:personalizeDialogue(selected.line.text,teacher),group:key,index:selected.i};
}
