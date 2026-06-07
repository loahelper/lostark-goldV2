const API_URL =
"https://developer-lostark.game.onstove.com";

let isOffline = false;
let savedRaidSelections = {};
let offlineCharacters = [];

/////////////////////////////////////////////////////
// API 키 저장
/////////////////////////////////////////////////////

window.onload = function(){

    document.getElementById("apiKey").value =
        localStorage.getItem("loaApiKey") || "";

    document
    .getElementById("characterCount")
    .addEventListener(
        "keydown",
        function(event){

            if(event.key === "Enter"){

                createOfflineCharacters();

            }

        }
    );

    const savedCharacters =
    localStorage.getItem(
        "offlineCharacters"
    );

    const savedRaids =
    localStorage.getItem(
        "savedRaidSelections"
    );

    if(savedRaids){

        savedRaidSelections =
        JSON.parse(savedRaids);

    }

    if(savedCharacters){

    isOffline = true;

    document
    .getElementById("status")
    .innerText =
    "오프라인 모드 (모든 캐릭터 계산)";

    offlineCharacters =
    JSON.parse(savedCharacters);

    displayCharacters(
        offlineCharacters
    );

}

    document.getElementById("apiKey")
    .addEventListener("change",function(){

        localStorage.setItem(
            "loaApiKey",
            this.value
        );

    });

    document
    .getElementById("characterName")
    .addEventListener("keydown", function(event){

        if(event.key === "Enter"){

            searchCharacter();

        }

    });

}
/////////////////////////////////////////////////////

const prices = {

"성당(3단계)":50000,
"성당(2단계)":40000,
"성당(1단계)":30000,

"세르카(나이트메어)":54000,
"세르카(하드)":44000,
"세르카(노말)":35000,

"종막(하드)":52000,
"종막(노말)":40000,

"4막(하드)":42000,
"4막(노말)":33000,

"3막(하드)":27000,
"3막(노말)":21000,

"2막(하드)":23000,
"2막(노말)":16500,

"1막(하드)":18000,
"1막(노말)":11500,

"서막(하드)":7200,

"베히모스":7200

};   // ← 여기서 prices 끝

const raidRequirements = {

"성당(3단계)":1750,
"성당(2단계)":1720,
"성당(1단계)":1700,

"세르카(나이트메어)":1740,
"세르카(하드)":1730,
"세르카(노말)":1710,

"종막(하드)":1730,
"종막(노말)":1710,

"4막(하드)":1720,
"4막(노말)":1700,

"3막(하드)":1700,
"3막(노말)":1680,

"2막(하드)":1690,
"2막(노말)":1670,

"1막(하드)":1680,
"1막(노말)":1660,

"서막(하드)":1640,

"베히모스":1640

};

const raidGroups = {

    "성당":[
        "성당(1단계)",
        "성당(2단계)",
        "성당(3단계)"
    ],

    "세르카":[
        "세르카(노말)",
        "세르카(하드)",
        "세르카(나이트메어)"
    ],

    "종막":[
        "종막(노말)",
        "종막(하드)"
    ],

    "4막":[
        "4막(노말)",
        "4막(하드)"
    ],

    "3막":[
        "3막(노말)",
        "3막(하드)"
    ],

    "2막":[
        "2막(노말)",
        "2막(하드)"
    ],

    "1막":[
        "1막(노말)",
        "1막(하드)"
    ]

};

const fullBoundRaids = [

"성당(3단계)",
"성당(2단계)",
"성당(1단계)"

];

const halfBoundRaids = [

"세르카(노말)",

"종막(노말)",

"4막(노말)",

"3막(하드)",
"3막(노말)",

"2막(하드)",
"2막(노말)",

"1막(하드)",
"1막(노말)",

"서막(하드)",

"베히모스"

];


/////////////////////////////////////////////////////

async function searchCharacter(){


    isOffline = false;

    const apiKey =
    document.getElementById("apiKey")
    .value
    .trim();

    const characterName =
    document.getElementById("characterName")
    .value
    .trim();

    if(!apiKey){

        alert("API 키를 입력하세요.");
        return;
    }

    if(!characterName){

        alert("캐릭터명을 입력하세요.");
        return;
    }

    document.getElementById("status")
    .innerText = "조회 중...";

    try{

        const response =
        await fetch(
        `${API_URL}/characters/${encodeURIComponent(characterName)}/siblings`,
        {
            headers:{
                accept:"application/json",
                authorization:`bearer ${apiKey}`
            }
        });

        if(!response.ok){

            throw new Error(
            "API 호출 실패"
            );
        }

        const data =
await response.json();

data.sort((a, b) => {

    const levelA =
    parseFloat(
        (a.ItemMaxLevel ||
         a.ItemAvgLevel ||
         "0")
        .replace(/,/g, "")
    );

    const levelB =
    parseFloat(
        (b.ItemMaxLevel ||
         b.ItemAvgLevel ||
         "0")
        .replace(/,/g, "")
    );

    return levelB - levelA;
});

console.log(data);

displayCharacters(data);

        document.getElementById("status")
        .innerText =
        `${data.length}개 캐릭터 조회 완료`;

    }
    catch(error){

        console.error(error);

        document.getElementById("status")
        .innerText =
        "조회 실패";

        alert(
        "API 키 또는 캐릭터명을 확인하세요."
        );
    }

}

/////////////////////////////////////////////////////

function displayCharacters(characters){

    const grid =
    document.getElementById(
    "characterGrid"
    );

    grid.innerHTML = "";

   const goldCharacters =
characters
.slice(
    0,
    isOffline
    ? characters.length
    : 6
)
.map(c => c.CharacterName);

    characters.forEach(char=>{

        const card =
        document.createElement("div");

        card.className =
        "character-card";

        const itemLevel =
parseFloat(
    (
        char.ItemMaxLevel ||
        char.ItemAvgLevel ||
        "0"
    ).replace(/,/g,"")
);
const isGoldCharacter =
goldCharacters.includes(
    char.CharacterName
);

        let html = `

        <h3>

${isGoldCharacter
? "🟢 "
: "⚪ "}

${char.CharacterName || "-"}

</h3>

${char.ServerName === "오프라인"
? `
<div style="text-align:right;">
<button onclick="deleteCharacter(this)">
삭제
</button>
</div>
`
: ""}

        <div
class="character-info"
data-name="${char.CharacterName}">

        서버 :
        ${char.ServerName || "-"}

        <br>

        클래스 :
        ${char.CharacterClassName || "-"}

        <br>

        아이템 레벨 :
        ${itemLevel}

        </div>

        <div class="raid-list" style="display:none;">
        `;

    const availableRaids = [];

for(let raid in prices){

    if(
        raidRequirements[raid] &&
        itemLevel >= raidRequirements[raid]
    ){

        availableRaids.push({
            name: raid,
            gold: prices[raid]
        });

    }

}

// 골드 높은 순 정렬
availableRaids.sort(
    (a,b) => b.gold - a.gold
);

const selectedGroups = [];
const autoCheckedRaids = [];

if(isGoldCharacter){

    availableRaids.forEach(raid => {

        let groupName = raid.name;

        for(let group in raidGroups){

            if(
                raidGroups[group]
                .includes(raid.name)
            ){
                groupName = group;
                break;
            }

        }

        if(
    !selectedGroups.includes(
        groupName
    )
    &&
    autoCheckedRaids.length < 3
){

    selectedGroups.push(
        groupName
    );

    autoCheckedRaids.push(
        raid.name
    );

}

    });

}

for(let raid in prices){

    let checked = "";

let savedRaids =
savedRaidSelections[
    char.CharacterName
];

if(savedRaids){

    if(
        savedRaids.includes(raid)
    ){
        checked = "checked";
    }

}
else{

    if(
        autoCheckedRaids.includes(raid)
    ){
        checked = "checked";
    }

}

    html += `
    <label>

    <input
    type="checkbox"
    ${checked}
    data-gold="${prices[raid]}"
    data-raid="${raid}"
    onchange="checkLimit(this)">

    ${raid}

    </label>
    `;
}    

html += `
</div>

<div class="selected-raids">
획득 레이드
</div>

<button onclick="openRaidModal(this)">
레이드 변경
</button>

<div class="char-total">

캐릭터 총 골드 : 0 골드
<br>
귀속 골드 : 0 골드
<br>
거래가능 골드 : 0 골드
</div>
`;

        card.innerHTML = html;

        grid.appendChild(card);

});

updateTotal();

}

function checkLimit(checkbox){

    let container =
    checkbox.closest(
        ".character-card"
    );

    if(!container){

        container =
        document.getElementById(
            "modalRaidList"
        );
    }

    const checkedCount =
    container.querySelectorAll(
        'input[type="checkbox"]:checked'
    ).length;

    if(
        checkedCount > 3
    ){

        checkbox.checked =
        false;

        alert(
        "캐릭터당 최대 3개까지 선택 가능합니다."
        );

        return;
    }

    updateTotal();
}
    

/////////////////////////////////////////////////////
function offlineMode(){

    isOffline = true;

    document
    .getElementById("offlineBox")
    .style.display = "block";

    document
.getElementById("status")
.innerText =
"오프라인 모드 (모든 캐릭터 계산)";
}

function updateTotal(){

    let totalGold = 0;
    let boundGold = 0;

    document
    .querySelectorAll(".character-card")
    .forEach(card=>{
        let charTotal = 0;
        let charBound = 0;

        let selectedRaids = [];

        card
        .querySelectorAll(
        'input[type="checkbox"]:checked'
        )
        .forEach(cb=>{

            const gold =
Number(cb.dataset.gold);

const raid =
cb.dataset.raid;

selectedRaids.push(raid);

charTotal += gold;
totalGold += gold;

            if(
    fullBoundRaids.includes(raid)
){
    boundGold += gold;
    charBound += gold;
}
else if(
    halfBoundRaids.includes(raid)
){
    boundGold += gold * 0.5;
    charBound += gold * 0.5;
}

        });

        card.querySelector(
".selected-raids"
).innerHTML =

`
획득 레이드<br>
• ${selectedRaids.join("<br>• ")}
`;
const charTradable =
charTotal - charBound;

card.querySelector(
".char-total"
).innerHTML =

`
캐릭터 총 골드 :
${charTotal.toLocaleString()} 골드

<br>

귀속 골드 :
${charBound.toLocaleString()} 골드

<br>

거래가능 골드 :
${charTradable.toLocaleString()} 골드
`;

    });

    const tradableGold =
    totalGold - boundGold;

    document
    .getElementById(
    "grandTotal"
    )
    .innerHTML =

    `
    총 골드 :
    ${totalGold.toLocaleString()} 골드

    <br><br>

    귀속 골드 :
    ${boundGold.toLocaleString()} 골드

    <br><br>

    거래가능 골드 :
    ${tradableGold.toLocaleString()} 골드
    `;
}
function generate(count){

    document.getElementById(
        "ganghaBox"
    ).style.display = "none";

    let result = "";

    for(let i=0;i<count;i++){

        result +=
        Math.random() < 0.5
        ? "⬅️ "
        : "➡️ ";

    }

    document
    .getElementById(
    "directionResult"
    )
    .innerText = result;
}

let currentCard = null;

function generateGangha(){

    const result =
    Math.random() < 0.5
    ? "⬅️"
    : "➡️";

    document.getElementById(
        "ganghaResult"
    ).innerText = result;

    document.getElementById(
        "ganghaBox"
    ).style.display = "block";
}

function openRaidModal(button){

    currentCard =
    button.closest(".character-card");

    const characterName =
    currentCard.querySelector(
        ".character-info"
    ).dataset.name;

    let savedRaids =
savedRaidSelections[
    characterName
];
if(!savedRaids){

    savedRaids = [];

    currentCard
    .querySelectorAll(
        ".raid-list input:checked"
    )
    .forEach(cb=>{

        savedRaids.push(
            cb.dataset.raid
        );

    });

}

    let html = "";

    for(let raid in prices){

        html += `
        <label>

        <input
        type="checkbox"
        data-raid="${raid}"

        ${
            savedRaids.includes(raid)
            ? "checked"
            : ""
        }

        onchange="checkLimit(this)">

        ${raid}

        </label>
        `;
    }

    document.getElementById(
        "modalRaidList"
    ).innerHTML = html;

    document.getElementById(
        "raidModal"
    ).style.display = "block";
}
function closeRaidModal(){

    document.getElementById(
        "raidModal"
    ).style.display =
    "none";
}

function saveRaidSelection(){

    const modalChecks =
    document.querySelectorAll(
        "#modalRaidList input[type='checkbox']"
    );

    const originalChecks =
    currentCard.querySelectorAll(
        ".raid-list input[type='checkbox']"
    );

    modalChecks.forEach(
        (modalCb,index)=>{

            originalChecks[index].checked =
            modalCb.checked;

        }
    );
   const characterName =
currentCard.querySelector(
    ".character-info"
).dataset.name;

savedRaidSelections[
    characterName
] = [];

modalChecks.forEach(cb=>{

    if(cb.checked){

        savedRaidSelections[
            characterName
        ].push(
            cb.dataset.raid
        );

    }

});

console.log(
    savedRaidSelections
);

    updateTotal();

    saveOfflineData();

    closeRaidModal();
}
function deleteCharacter(button){

    const card =
    button.closest(
        ".character-card"
    );

    const characterName =
    card.querySelector(
        ".character-info"
    ).dataset.name;

    offlineCharacters =
    offlineCharacters.filter(
        c =>
        c.CharacterName !==
        characterName
    );

    displayCharacters(
        offlineCharacters
    );
    saveOfflineData();
}
function createOfflineCharacters(){

    const count =
    Number(
        document
        .getElementById(
            "characterCount"
        )
        .value
    );

    if(
        count < 1 ||
        count > 30
    ){
        alert(
        "1~30 사이로 입력하세요."
        );
        return;
    }

    let html = "";

    for(
        let i = 1;
        i <= count;
        i++
    ){

        html += `
        <div style="margin:8px 0;">

        캐릭터${i}
        아이템레벨

        <input
type="number"
id="level${i}"
placeholder="예: 1770"
onkeydown="handleLevelEnter(event)">

        </div>
        `;

    }

    html += `
    <br>

    <button onclick="applyOfflineCharacters()">
    적용
    </button>
    `;

    document
    .getElementById(
        "offlineLevelBox"
    )
    .innerHTML = html;

    document
    .getElementById(
        "offlineLevelBox"
    )
    .style.display = "block";
   
}
function applyOfflineCharacters(){

    const count =
    Number(
        document
        .getElementById(
            "characterCount"
        )
        .value
    );

    offlineCharacters = [];

    for(
        let i = 1;
        i <= count;
        i++
    ){

        const level =
        Number(
            document
            .getElementById(
                `level${i}`
            )
            .value
        ) || 0;

        offlineCharacters.push({

            CharacterName:
            `캐릭터 ${i}`,

            CharacterClassName:
            "직접입력",

            ItemMaxLevel:
            level.toString(),

            ServerName:
            "오프라인"

        });

    }

    displayCharacters(
    offlineCharacters
);

saveOfflineData();

document
.getElementById(
    "offlineLevelBox"
)
.style.display = "none";
}

function handleLevelEnter(event){

    if(event.key === "Enter"){

        applyOfflineCharacters();

    }

}
function saveOfflineData(){

    localStorage.setItem(
        "offlineCharacters",
        JSON.stringify(offlineCharacters)
    );

    localStorage.setItem(
        "savedRaidSelections",
        JSON.stringify(savedRaidSelections)
    );

}
function clearOfflineData(){

    if(
        !confirm(
            "저장된 오프라인 데이터를 모두 삭제할까요?"
        )
    ){
        return;
    }

    localStorage.removeItem(
        "offlineCharacters"
    );

    localStorage.removeItem(
        "savedRaidSelections"
    );

    offlineCharacters = [];
    savedRaidSelections = {};

    document
    .getElementById(
        "characterGrid"
    )
    .innerHTML = "";

    document
    .getElementById(
        "offlineLevelBox"
    )
    .style.display = "none";

    updateTotal();

    alert(
        "오프라인 데이터가 초기화되었습니다."
    );

}

