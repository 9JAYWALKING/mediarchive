// Authored companion questions, not edits of official exam questions.
// Source snapshot: local cardiovascular course-data.js / lecture-notes.js, 2026-11-09.
export const lessons = [
 {id:1,name:'심장의 전기활동',start:'2026-11-03T12:00:00+09:00',end:'2026-11-03T14:00:00+09:00'},
 {id:2,name:'심장의 기계적활동',start:'2026-11-03T14:00:00+09:00',end:'2026-11-03T16:00:00+09:00'},
 {id:6,name:'심박출량조절',start:'2026-11-05T10:00:00+09:00',end:'2026-11-05T12:00:00+09:00'}
];
export const topics = [
 {id:'ap',lesson:1,name:'활동전위'}, {id:'ecg',lesson:1,name:'전도·ECG'},
 {id:'calcium',lesson:2,name:'수축·이완'}, {id:'cycle',lesson:2,name:'심장주기'},
 {id:'output',lesson:6,name:'심박출량·Fick'}, {id:'return',lesson:6,name:'심장·정맥환류 곡선'}
];
// minStage: Wiki=1, J=2, JBL=3. Completion is explicitly entered by the user.
export const questions = [
 {id:'ap-na',topic:'ap',minStage:1,text:'심실근의 phase 0은 어떤 이온이 들어오면서 생기는 거야?',choices:['Na⁺','Ca²⁺','K⁺'],answer:0,explanation:'심실근의 빠른 상승부는 fast Na⁺ channel을 통한 Na⁺ 유입이다.',section:'두 종류의 활동전위'},
 {id:'ap-ca',topic:'ap',minStage:1,text:'그럼 SA node의 phase 0도 Na⁺가 만드는 거야? 주역을 골라 줘!',choices:['Fast Na⁺ channel','L-type Ca²⁺ channel','K⁺의 유출'],answer:1,explanation:'SA node의 phase 0은 L-type Ca²⁺ channel을 통한 Ca²⁺ 유입으로 생긴다.',section:'두 종류의 활동전위'},
 {id:'ecg-pr',topic:'ecg',minStage:1,text:'AV 전도가 느려졌는지 보려면 ECG에서 어느 간격부터 봐?',choices:['QT interval','ST segment','PR interval'],answer:2,explanation:'PR interval은 P 시작부터 QRS 시작까지다. AV 전도의 변화와 연결해서 읽는다.',section:'AV node 잠깐 기다리는 이유'},
 {id:'ecg-p',topic:'ecg',minStage:1,text:'나 P파가 뭘 나타내는지 헷갈렸어. 이거 뭐였지?',choices:['심방 탈분극','심실 탈분극','심실 재분극'],answer:0,explanation:'P는 심방 탈분극, QRS는 심실 탈분극, T는 심실 재분극이다.',section:'P QRS T는 무엇이 움직이는 시간인가'},
 {id:'calcium-serca',topic:'calcium',minStage:1,text:'수축이 끝났어! Ca²⁺를 SR 안으로 다시 데려가는 건 누구야?',choices:['NCX','SERCA','Fast Na⁺ channel'],answer:1,explanation:'SERCA는 Ca²⁺를 SR로 회수한다. NCX·PMCA는 세포 밖으로 내보내는 경로다.',section:'전기 신호를 수축으로 바꾸는 Ca²⁺'},
 {id:'calcium-cicr',topic:'calcium',minStage:1,text:'CICR의 시작 신호가 되는 Ca²⁺는 어디에서 와?',choices:['미토콘드리아에서만','핵에서','L-type channel을 통해 세포 밖에서'],answer:2,explanation:'세포 밖에서 유입된 Ca²⁺가 SR의 추가 Ca²⁺ 방출을 유도한다.',section:'전기 신호를 수축으로 바꾸는 Ca²⁺'},
 {id:'cycle-iso',topic:'cycle',minStage:1,text:'등용적 수축 중이래. 용적과 압력은 어떻게 되는 거야?',choices:['용적 일정 · 압력 상승','용적 감소 · 압력 상승','용적 증가 · 압력 감소'],answer:0,explanation:'승모판 폐쇄부터 대동맥판 개방까지, 용적은 EDV로 일정하고 압력은 올라간다.',section:'등용적 수축'},
 {id:'cycle-s1',topic:'cycle',minStage:1,text:'첫 번째 심음 S1! 어떤 사건이랑 연결하면 돼?',choices:['반월판막 폐쇄','급속 충만','방실판막 폐쇄'],answer:2,explanation:'S1은 방실판막 폐쇄, S2는 반월판막 폐쇄와 연결한다.',section:'심음'},
 {id:'output-fick',topic:'output',minStage:2,text:'산소 소비량 250 mL/min, 동맥·혼합정맥 산소 함량이 20·15 mL/dL이면 심박출량은?',choices:['0.5 L/min','5 L/min','50 L/min'],answer:1,explanation:'250 ÷ (20−15) = 50 dL/min = 5 L/min. 분모는 산소 분압이 아니라 함량 차이다.',section:'산소 소비량이 주어지면 Fick 원리로 CO를 구한다'},
 {id:'output-factors',topic:'output',minStage:1,text:'심박출량을 결정하는 네 가지를 묶은 건 어느 쪽이야?',choices:['HR·수축력·preload·afterload','HR·체온·키·몸무게','P파·QRS·T파·ST'],answer:0,explanation:'심박출량의 네 결정 요인은 HR, myocardial contractility, preload, afterload다.',section:'심박출량의 네 가지 결정 요인'},
 {id:'return-blood',topic:'return',minStage:2,text:'순응도와 저항은 그대로 두고 수혈했어. Pmc는 어떻게 될까?',choices:['감소','변하지 않음','증가'],answer:2,explanation:'수혈로 혈액량이 늘면 Pmc가 증가하고 정맥환류 곡선이 평행 이동한다. 저항·순응도는 같다는 조건이다.',section:'순응도·저항이 같을 때 수혈·출혈의 곡선 변화'},
 {id:'return-pump',topic:'return',minStage:3,text:'다른 조건은 그대로, 심장 수축력만 올렸어. 새 평형에서 CO와 우심방압은?',choices:['CO 증가 · 우심방압 증가','CO 증가 · 우심방압 감소','CO 감소 · 우심방압 증가'],answer:1,explanation:'수축력만 증가하면 같은 정맥환류 조건에서 심장이 더 잘 비워져 CO는 늘고 우심방압(Pᵥ)은 낮아진다.',section:'마지막 연결 네 가지 변화를 말로 풀어 보기'}
];
export const reactions = {
 invite:['나 질문 있어! 이거 하나만 알려 줘.','있지, 아까 본 거잖아. 너라면 알 것 같아서!','잠깐! 나랑 하나만 맞혀 볼래?'],
 correct:['오, 역시! 너한테 물어보길 잘했네.','정답! 헤헤, 좀 든든한데?','맞아! 이번엔 네가 한 수 위네.'],
 wrong:['우우, 뭐야… 이건 알 줄 알았는데! 다음엔 꼭 알려 줘.','에에, 너만 믿고 물어봤는데… 같이 다시 보자.','아쉽다아… 다음번엔 자신 있게 대답해 주기야!'],
 recover:['이번엔 맞혔네! 응, 아까 아쉬웠던 건 취소.','기억해 왔구나! 좋아, 다시 믿어도 되겠네.'],
 later:['응, 이따 물어볼게.','알았어! 지금 하던 것부터 마저 해.']
};
