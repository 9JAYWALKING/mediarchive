import {illustrationOvertime} from './illustration-context.js?v=20261114studentVoices';
const lines={
 ritsu:{expression:'disappointed',text:'…이제 왔네. 복도에서 소리 날 때마다 봤는데. 다음엔 기다리게 하지 마.'},
 haru:{expression:'angry',text:'왜 이제 와! 나 기다렸는데… 다음엔 조금만 일찍 와 줘.'},
 nagi:{expression:'cry',text:'나… 계속 기다렸어. 안 오는 줄 알고… 조금 울 뻔했어.'},
 shiori:{expression:'angry',text:'시계를 몇 번이나 봤는지 알아? 네 자리까지 정리해 뒀는데. …늦었어.'},
 rei:{expression:'disappointed',text:'…이제 왔네. 기다리지 않았다고 하려 했는데, 오늘은 못 그러겠어.'}
};
for(const id of Object.keys(illustrationOvertime))lines[id]={expression:['momo','akari','ibuki'].includes(id)?'angry':'disappointed',text:{ibuki:'오프닝이 한참 지났잖아! 기다리는 방송은 힘들다고…',mio:'이제 왔네. 무슨 일 있나 걱정했어. 다음엔 너무 늦지 말아 줘.',sena:'문 쪽을 몇 번이나 봤는지 알아? …늦었네.',aoi:'왜 이제 와! 네 자리까지 오는 길에서 헤맨 줄 알았잖아.',akari:'늦었어! 약속한 시간에 오는 건 기본이잖아. 나 기다렸다고.',momo:'왜 이제 와! 선배가 계속 기다렸잖아! 다음엔 꼭 먼저 와.',tsumugi:'이제 왔네. 같이 시작하려고 남겨 뒀는데. 조금 속상했어.'}[id]};
export function arrivalGreeting(event){
 const students=Object.keys(lines).filter(id=>event.students.includes(id));
 const pool=students.length?students:Object.keys(lines);
 const index=Math.floor(Date.parse(event.date+'T00:00:00+09:00')/86400000)%pool.length;
 const student=pool[index];return {student,...lines[student]};
}
