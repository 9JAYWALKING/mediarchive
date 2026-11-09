const lines={
 haru:{expression:'angry',text:'왜 이제 와! 나 기다렸는데… 다음엔 조금만 일찍 와 줘.'},
 nagi:{expression:'cry',text:'나… 계속 기다렸어. 안 오는 줄 알고… 조금 울 뻔했어.'},
 shiori:{expression:'angry',text:'시계를 몇 번이나 봤는지 알아? 네 자리까지 정리해 뒀는데. …늦었어.'},
 rei:{expression:'disappointed',text:'…이제 왔네. 기다리지 않았다고 하려 했는데, 오늘은 못 그러겠어.'}
};
export function arrivalGreeting(event){
 const students=Object.keys(lines).filter(id=>event.students.includes(id));
 const pool=students.length?students:Object.keys(lines);
 const index=Math.floor(Date.parse(event.date+'T00:00:00+09:00')/86400000)%pool.length;
 const student=pool[index];return {student,...lines[student]};
}
