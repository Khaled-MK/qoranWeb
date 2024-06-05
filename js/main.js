const glob = document.getElementById("global");
const searchBar = document.getElementById("searchBar");
let sourats;

window.addEventListener("load", async () => {
   await fetch(`https://api.quran.com/api/v4/chapters`, {
      method: "GET",
      headers: {
         "Content-Type": "application/json",
      },
   })
      .then((response) => {
         if (!response.ok) {
            throw new Error(`Erreur HTTP! Statut : ${response.status}`);
         }
         return response.json();
      })
      .then((data) => {
         srtDisplay(data.chapters);
         let lecBtns = document.querySelectorAll(".btn");
         lecture(lecBtns);
      });
});

searchBar.addEventListener("input", () => {
   let sowar = document.querySelectorAll(".soura");
   const input = searchBar.value;

   sowar.forEach((soura) => {
      let arTitre = soura.firstChild.firstChild.textContent;
      let frTitre = soura.firstChild.lastChild.textContent.toLocaleLowerCase();

      if (arTitre.includes(input) || frTitre.includes(input.toLocaleLowerCase())) {
         soura.classList.remove("hidden");
         console.log(soura);
      } else {
         soura.classList.add("hidden");
      }
   });
});

function formatTime(seconds) {
   const minutes = Math.floor(seconds / 60);
   const secs = Math.floor(seconds % 60);
   return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function srtDisplay(data) {
   sourats = data;

   data.forEach((soura) => {
      const bigDiv = document.createElement("div");
      const titreDiv = document.createElement("div");
      const versesDiv = document.createElement("div");
      const placeDiv = document.createElement("div");
      const btnDiv = document.createElement("div");
      const arH = document.createElement("h2");
      const frH = document.createElement("h3");
      const vPara = document.createElement("p");
      const vArPara = document.createElement("p");
      const vFrPara = document.createElement("p");
      const arPlacePara = document.createElement("p");
      const frPlacePara = document.createElement("p");
      const lecBtn = document.createElement("button");
      const arNom = document.createTextNode(soura.name_arabic);
      const frNom = document.createTextNode(soura.name_simple);
      const frVerses = document.createTextNode(`Verses`);
      const arVerses = document.createTextNode("الآيات");
      const verses = document.createTextNode(soura.verses_count);

      bigDiv.classList.add("bg-white", "rounded-xl", "shadow-md", "px-3", "pt-6", "pb-2", "gap-y-10", "text-xl", "soura");
      titreDiv.classList.add("my-3", "text-center", "font-semibold");
      arH.classList.add("arTitre", "text-2xl");
      frH.classList.add("frTitre", "text-xl");
      versesDiv.classList.add("flex", "justify-between");
      placeDiv.classList.add("flex", "justify-between");
      btnDiv.classList.add("my-4", "w-full", "flex", "justify-center");
      lecBtn.classList.add("btn", "bn632-hover", "bn25", "flex", "justify-center", "py-1", "px-14", "text-xl", "text-white", "cursor-pointer", "select-none");
      vPara.classList.add("font-bold");

      arH.append(arNom);
      frH.append(frNom);
      vArPara.append(arVerses);
      vFrPara.append(frVerses);
      vPara.append(verses);

      if (soura.revelation_place === "makkah") {
         arPlacePara.append(document.createTextNode(`مكية`));
         frPlacePara.append(document.createTextNode(`Makkia`));
      } else if (soura.revelation_place === "madinah") {
         arPlacePara.append(document.createTextNode(`مدنية`));
         frPlacePara.append(document.createTextNode(`Madania`));
      } else {
         arPlacePara.append(document.createTextNode(`لايوجد`));
         frPlacePara.append(document.createTextNode(`intouvable`));
      }

      lecBtn.append(document.createTextNode("قرائة"));

      btnDiv.append(lecBtn);
      placeDiv.append(arPlacePara, frPlacePara);
      versesDiv.append(vArPara, vPara, vFrPara);
      titreDiv.append(arH, frH);
      bigDiv.append(titreDiv, versesDiv, placeDiv, btnDiv);

      bigDiv.id = soura.id;

      glob.append(bigDiv);
   });
   return sourats;
}

function lecture(lecBtns) {
   lecBtns.forEach((btn) => {
      btn.addEventListener("click", async () => {
         let bigDiv = btn.parentElement.parentElement;
         const lecDiv = document.createElement("div");
         const ctrlDiv = document.createElement("div");
         const backBtn = document.createElement("button");
         const playBtn = document.createElement("button");
         const fwdBtn = document.createElement("button");
         const stopBtn = document.createElement("button");
         const backi = document.createElement("i");
         const playi = document.createElement("i");
         const fwdi = document.createElement("i");
         const stopi = document.createElement("i");
         const audio = document.createElement("audio");
         const timeSpan = document.createElement("span");
         const progSpan = document.createElement("span");
         const curTimeSpan = document.createElement("span");
         const fullTimeSpan = document.createElement("span");
         const secDiv = document.createElement("div");
         const switchDiv = document.createElement("div");
         const reapSan = document.createElement("span");
         const label = document.createElement("label");
         const input = document.createElement("input");
         const div = document.createElement("div");
         const ptDiv = document.createElement("div");

         switchDiv.append(reapSan, label);
         div.append(ptDiv);
         label.append(input, div);
         reapSan.append(document.createTextNode("إعادة"));
         secDiv.append(bigDiv.firstChild, switchDiv);
         bigDiv.prepend(secDiv);

         input.type = "checkbox";

         ptDiv.classList.add("toggle-switch-handle");
         div.classList.add("toggle-switch-background");
         label.classList.add("toggle-switch", "mt-1");
         switchDiv.classList.add("w-1/2", "flex", "justify-end", "px-2", "gap-x-2", "content-start");
         secDiv.classList.add("my-3", "flex", "justify-between");
         bigDiv.classList.add("col-span-2", "gap-y-10");
         bigDiv.firstChild.firstChild.classList.remove("text-center", "my-3");
         bigDiv.firstChild.firstChild.classList.add("w-1/2");
         lecDiv.classList.add("my-4", "px-4", "flex", "items-center", "justify-center", "gap-x-3", "text-[16px]");
         ctrlDiv.classList.add("flex", "gap-2", "justify-center");
         backBtn.classList.add("controls", "bg-green-600", "hover:bg-green-800", "text-white", "px-5", "py-2", "text-xl", "rounded-lg", "flex", "justify-center", "items-center");
         playBtn.classList.add("controls", "bg-green-100", "hover:bg-green-800", "text-white", "px-5", "py-2", "text-xl", "rounded-lg", "flex", "justify-center", "items-center", "gap-2");
         fwdBtn.classList.add("controls", "bg-green-600", "hover:bg-green-800", "text-white", "px-5", "py-2", "text-xl", "rounded-lg", "flex", "justify-center", "items-center");
         stopBtn.classList.add("controls", "bg-green-600", "hover:bg-green-800", "text-white", "px-5", "py-2", "text-xl", "rounded-lg", "flex", "justify-center", "items-center");
         backi.classList.add("fa", "fa-step-forward");
         playi.classList.add("fa", "fa-play", "rot");
         fwdi.classList.add("fa", "fa-step-backward");
         stopi.classList.add("fa", "fa-stop");
         timeSpan.classList.add("w-full", "relative", "rounded-full", "h-[6px]", "bg-gray-300", "cursor-pointer");
         progSpan.classList.add("absolute", "top-0", "right-0", "rounded-full", "h-[6px]", "bg-green-600");

         curTimeSpan.textContent = "0:00";
         timeSpan.append(progSpan);
         lecDiv.append(curTimeSpan, timeSpan, fullTimeSpan, audio);

         backBtn.append(backi);
         playBtn.append(playi);
         fwdBtn.append(fwdi);
         stopBtn.append(stopi);
         ctrlDiv.append(backBtn, playBtn, fwdBtn, stopBtn);
         bigDiv.append(lecDiv, ctrlDiv);

         bigDiv.children[3].remove();
         bigDiv.children[2].remove();
         bigDiv.children[1].remove();

         audio.src = `https://download.quranicaudio.com/qdc/hani_ar_rifai/murattal/${bigDiv.id}.mp3`;
         audio.classList.add("audio");

         audio.addEventListener("loadedmetadata", () => {
            fullTimeSpan.append(document.createTextNode(formatTime(audio.duration)));
         });
         audio.addEventListener("canplay", () => {
            playBtn.classList.add("bg-green-600");
         });
         backBtn.addEventListener("click", () => {
            audio.currentTime = parseFloat(audio.currentTime) - 10;
         });
         fwdBtn.addEventListener("click", () => {
            audio.currentTime = parseFloat(audio.currentTime) + 10;
         });

         playBtn.addEventListener("click", () => {
            let audios = document.querySelectorAll(".audio");

            let playsbtn = document.querySelectorAll(".fa-pause");

            for (let i = 0; i < audios.length; i++) {
               audios[i].pause();
            }

            if (playi.classList.contains("fa-play") || playi.classList.contains("fa-rotate-left")) {
               playi.classList.add("fa-pause");
               playi.classList.remove("fa-play");
               playi.classList.remove("fa-rotate-left");
               audio.play();
            } else {
               playi.classList.remove("fa-pause");
               playi.classList.remove("fa-rotate-left");
               playi.classList.add("fa-play");
               audio.pause();
            }
            for (let i = 0; i < playsbtn.length; i++) {
               playsbtn[i].classList.add("fa-play");
               playsbtn[i].classList.remove("fa-pause");
            }
         });

         stopBtn.addEventListener("click", () => {
            playi.classList.remove("fa-pause");
            playi.classList.add("fa-rotate-left");
            audio.pause();
            audio.currentTime = 0;
         });

         audio.addEventListener("timeupdate", async () => {
            progSpan.style.width = `${(audio.currentTime * 100) / audio.duration}%`;
            curTimeSpan.textContent = formatTime(audio.currentTime);

            if (audio.currentTime === audio.duration && input.checked) {
               audio.currentTime = 0;
               audio.play();
            } else if (audio.currentTime === audio.duration && !input.checked) {
               playi.classList.remove("fa-pause");
               playi.classList.add("fa-rotate-left");
            }
         });

         timeSpan.addEventListener("click", (e) => {
            const spanWidth = e.target.getBoundingClientRect().width;
            pxPosition = e.clientX - e.target.getBoundingClientRect().left;
            position = (spanWidth - pxPosition) / spanWidth;
            progSpan.style.width = `${position * 100}%`;
            audio.currentTime = position * audio.duration;
         });
         input.addEventListener("change", (e) => {
            if (e.target.checked) {
            }
         });
      });
   });
}

// let a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// let b = a.filter((num) => {
//    return num % 2 === 0;
// });
// console.log(b);
// console.log(a);
