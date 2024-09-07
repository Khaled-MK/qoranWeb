const mic = document.querySelector(".mic");
const trascDiv = document.getElementById("transc");
const global = document.getElementById("global");
const resultDiv = document.getElementById("results");
const comptDiv = document.getElementById("compteur");
const searchProg = document.getElementById("searchProg");
const cssRules = document.styleSheets[2].cssRules;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "ar-SA";
let verses;
let showSowar;
let sowar;

window.addEventListener("load", async () => {
   let reponse = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani_simple", {
      method: "GET",
      headers: { "contenet-Type": "application/json" },
   });
   if (!reponse.ok) {
      throw new Error(`Erreur HTTP! Statut : ${reponse.status}`);
   }
   let result = await reponse.json();
   verses = result.verses;
   // console.log(verses);

   let showReponse = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani", {
      method: "GET",
      headers: { "contenet-Type": "application/json" },
   });
   if (!showReponse.ok) {
      throw new Error(`Erreur HTTP! Statut : ${showReponse.status}`);
   }
   let showSowar = await showReponse.json();
   showVerses = showSowar.verses;
   // console.log(showVerses);

   let sowarResponse = await fetch("https://api.quran.com/api/v4//chapters", {
      method: "GET",
      headers: { "contenet-Type": "application/json" },
   });
   if (!sowarResponse.ok) {
      throw new Error(`Erreur HTTP! Statut : ${sowarResponse.status}`);
   }
   let sowarResult = await sowarResponse.json();
   sowar = sowarResult.chapters;
});

recognition.addEventListener("result", (event) => {
   const transcript = event.results[0][0].transcript;
   // const transcript = "الله لا إله إلا هو الحي القيوم";
   // console.log(transcript);
   for (let i = trascDiv.childNodes.length - 1; i >= 0; i--) {
      trascDiv.childNodes[i].remove();
   }

   for (let i = resultDiv.childNodes.length - 1; i >= 0; i--) {
      resultDiv.childNodes[i].remove();
   }

   let text = document.createTextNode("");
   text = document.createTextNode(transcript);

   console.log(verses);
   trascDiv.append(text);
   verses.forEach((verse, index) => {
      // if (index === 6) {
      // if (verse.text_uthmani_simple.length > 100) {
      //    console.log(verse.text_uthmani_simple);
      //    console.log(verse.text_uthmani_simple.length);
      // }

      // 6236
      // searchProg.style.cssText = `width : ${index}/6236%`;
      // console.log(index);
      // searchProg.style.cssText = `width: ${(index * 100) / 6236}%`;

      const verseSet = new Set(verse.text_uthmani_simple.split(" "));
      const transcSet = new Set(transcript.split(" "));
      const intersection = new Set([...verseSet].filter((x) => transcSet.has(x)));
      const union = new Set([...verseSet, ...transcSet]);

      let result = intersection.size / union.size;
      if (result > 0.3) {
         let soura = verse.verse_key.split(":")[0];
         let aya = verse.verse_key.split(":")[1];
         let souraName = sowar[soura - 1].name_arabic;
         let div = document.createElement("div");
         let para = document.createElement("p");
         let souraPara = document.createElement("p");
         let ayaSpan = document.createElement("span");

         div.id = verse.verse_key;

         div.classList.add("rslt", "flex", "justify-between", "items-center", "gap-x-1", "bg-white", "rounded-full", "px-2", "shadow-md", "cursor-pointer", "select-none");
         para.classList.add("font-uthmani", "overflow-hidden", "text-ellipsis", "whitespace-pre", "h-10", "flex", "items-center");
         souraPara.classList.add("text-sm", "flex", "items-center", "para");
         ayaSpan.append(document.createTextNode(aya));
         souraPara.append(document.createTextNode(souraName), " : ", ayaSpan);
         para.append(document.createTextNode(showVerses[verse.id - 1].text_uthmani));
         div.append(para, souraPara);
         resultDiv.append(div);
      }
   });
});

const updateVolume = () => {
   const bufferLength = analyser.frequencyBinCount;
   const dataArray = new Uint8Array(bufferLength);
   analyser.getByteFrequencyData(dataArray);
   const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

   for (let i = 0; i < cssRules.length; i++) {
      if (cssRules[i].cssText.includes("@keyframes listin")) {
         cssRules[i][1].style.cssText = `transform: scale(${1 + volume / 100}); opacity: 0.2;`;
      }
   }

   animationFrameId = requestAnimationFrame(updateVolume);
};

const startRecording = () => {
   // console.log("recording...");
   mic.classList.add("listening");
   for (let i = resultDiv.children.length - 1; i >= 0; i--) {
      resultDiv.children[i].remove();
   }

   resultDiv.classList.add("grid", "grid-cols-1", "text-ellipsis", "whitespace-pre", "overflow-x-hidden", "my-4");
   resultDiv.classList.remove("flex", "flex-wrap", "justify-center", "bg-white", "rounded-lg", "shadow-lg", "px-2", "mb-16", "mt-4");

   navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
         audioContext = new (window.AudioContext || window.webkitAudioContext)();
         mediaStreamSource = audioContext.createMediaStreamSource(stream);
         analyser = audioContext.createAnalyser();
         analyser.fftSize = 256;

         mediaStreamSource.connect(analyser);

         updateVolume();
      })
      .catch((err) => {
         console.error("Error accessing audio stream", err);
      });

   recognition.start();
};

const stopRecording = () => {
   mic.classList.remove("listening");
   recognition.stop();
   cancelAnimationFrame(animationFrameId);
   if (mediaStreamSource) {
      mediaStreamSource.disconnect();
      mediaStreamSource.mediaStream.getTracks().forEach((track) => track.stop());
   }
   if (audioContext) {
      audioContext.close();
   }
};

mic.addEventListener("click", () => {
   if (mic.lastElementChild.classList.contains("fa-microphone")) {
      startRecording();
      // console.log(searchProg);
      // searchProg.style.cssText = "width : 30%";

      mic.lastElementChild.classList.remove("fa-microphone");
      mic.lastElementChild.classList.add("fa-stop");

      setTimeout(() => {
         stopRecording();
         mic.lastElementChild.classList.add("fa-microphone");
         mic.lastElementChild.classList.remove("fa-stop");
      }, 5000);
   } else {
      stopRecording();
      mic.lastElementChild.classList.add("fa-microphone");
      mic.lastElementChild.classList.remove("fa-stop");
   }
});

resultDiv.addEventListener("click", async (e) => {
   if (e.target.classList.contains("rslt")) {
      // console.log(e.target);
      let souraDiv = e.target;
      let soura = souraDiv.id.split(":")[0];
      let aya = souraDiv.id.split(":")[1];

      let reponse = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${soura}`, {
         method: "GET",
         headers: { "contenet-Type": "application/json" },
      });
      if (!reponse.ok) {
         throw new Error(`Erreur HTTP! Statut : ${reponse.status}`);
      }
      let result = await reponse.json();
      let wantedSourat = result.verses;
      let firstV = wantedSourat[0].id - 1;
      let bigDiv = souraDiv.parentElement;

      let lastV = firstV + sowar[soura - 1].verses_count - 1;

      for (let i = bigDiv.children.length - 1; i >= 0; i--) {
         bigDiv.children[i].remove();
      }

      for (let i = trascDiv.childNodes.length - 1; i >= 0; i--) {
         trascDiv.childNodes[i].remove();
      }

      bigDiv.classList.remove("grid", "grid-cols-1", "text-ellipsis", "whitespace-pre", "overflow-x-hidden", "my-4");
      bigDiv.classList.add("flex", "flex-wrap", "justify-center", "bg-white", "rounded-lg", "shadow-lg", "px-2", "mb-16", "mt-4");

      let h = document.createElement("h2");
      h.classList.add("mb-4", "w-full", "text-center", "text-2xl");
      h.append(document.createTextNode(sowar[soura - 1].name_arabic));

      bigDiv.append(h);

      for (let v = firstV; v <= lastV; v++) {
         let p = document.createElement("p");
         let span = document.createElement("span");
         let smallSpan = document.createElement("span");

         p.classList.add("text-center", "inline", "verse", "ayats");
         span.classList.add("inline-block", "mx-2", "w-6", "h-6", "text-[10px]", "rounded-full", "border-[1px]", "border-gray-800", "border-gray-800");
         smallSpan.classList.add("w-full", "h-full", "flex", "justify-center", "items-center");

         p.append(document.createTextNode(showVerses[v].text_uthmani));
         smallSpan.append(document.createTextNode(showVerses[v].verse_key.split(":")[1]));
         span.append(smallSpan);
         p.append(span);
         bigDiv.append(p);

         p.id = showVerses[v].verse_key.split(":")[1];
      }
      // console.log(aya);
      let ayats = document.querySelectorAll(".ayats");
      for (let i = 0; i < ayats.length; i++) {
         if (ayats[i].id === aya) {
            const rect = ayats[i].getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollY = rect.top + scrollTop - 200;
            window.scrollTo({
               top: scrollY,
               behavior: "smooth",
            });

            ayats[i].classList.add("bg-yellow-50");

            setTimeout(() => {
               ayats[i].classList.remove("bg-yellow-50");
            }, 4000);
         }
      }
      showLec(soura, aya);
   }
});

async function showLec(soura, aya) {
   console.log(soura);
   console.log(aya);
   const lecDiv = document.createElement("div");
   const headDiv = document.createElement("div");
   const titreDiv = document.createElement("div");
   const arH = document.createElement("h2");
   const frH = document.createElement("h2");
   const switchDiv = document.createElement("div");
   const smallSwitchDiv = document.createElement("div");
   const repeatSpan = document.createElement("span");
   const lab = document.createElement("label");
   const swithIn = document.createElement("input");
   const togDiv = document.createElement("div");
   const smTogDiv = document.createElement("div");
   const progDiv = document.createElement("div");
   const currTimeSpan = document.createElement("span");
   const rangeIn = document.createElement("input");
   const fullTimeSpan = document.createElement("span");
   const audio = document.createElement("audio");
   const ctrlDiv = document.createElement("div");
   const backBtn = document.createElement("button");
   const playBtn = document.createElement("button");
   const downBtn = document.createElement("button");
   const fwdBtn = document.createElement("button");
   const stopBtn = document.createElement("button");
   const backi = document.createElement("i");
   const downi = document.createElement("i");
   const playi = document.createElement("i");
   const fwdi = document.createElement("i");
   const stopi = document.createElement("i");

   let askedSoura = sowar[soura - 1];

   backBtn.classList.add("controls", "w-8", "h-8", "bg-green-600", "text-white", "text-[16px]", "rounded-full", "flex", "justify-center", "items-center");
   playBtn.classList.add("controls", "play", "w-8", "h-8", "bg-green-600", "text-white", "text-[16px]", "rounded-full", "flex", "justify-center", "items-center");
   fwdBtn.classList.add("controls", "w-8", "h-8", "bg-green-600", "text-white", "text-[16px]", "rounded-full", "flex", "justify-center", "items-center");
   stopBtn.classList.add("controls", "w-8", "h-8", "bg-green-600", "text-white", "text-[16px]", "rounded-full", "flex", "justify-center", "items-center");
   downBtn.classList.add("controls", "down", "w-8", "h-8", "bg-green-600", "text-white", "text-[16px]", "rounded-full", "flex", "justify-center", "items-center");
   downi.classList.add("fa-solid", "fa-download");
   backi.classList.add("fa", "fa-angles-right");
   playi.classList.add("fa", "fa-play", "rot");
   fwdi.classList.add("fa", "fa-angles-left");
   stopi.classList.add("fa", "fa-stop");
   ctrlDiv.classList.add("flex", "gap-4", "justify-cente");
   headDiv.classList.add("time-bar");
   progDiv.classList.add("my-1", "px-4", "flex", "items-center", "justify-center", "gap-x-3", "text-[16px]");
   smTogDiv.classList.add("toggle-switch-handle");
   togDiv.classList.add("toggle-switch-background");
   lab.classList.add("toggle-switch", "mt-2");
   switchDiv.classList.add("w-1/2", "flex", "flex-col", "items-end", "justify-end", "px-2", "content-start");
   titreDiv.classList.add("w-1/2", "font-semibold", "text-lg");
   headDiv.classList.add("flex", "justify-between");
   lecDiv.classList.add("w-full", "mx-auto", "front", "rounded-xl", "px-3", "py-2", "gap-y-2", "text-xl", "border-2", "border-green-600");

   arH.append(document.createTextNode(askedSoura.name_arabic));
   frH.append(document.createTextNode(askedSoura.name_simple));

   downBtn.append(downi);
   backBtn.append(backi);
   playBtn.append(playi);
   fwdBtn.append(fwdi);
   stopBtn.append(stopi);

   ctrlDiv.append(backBtn, playBtn, fwdBtn, stopBtn, downBtn);
   progDiv.append(audio, currTimeSpan, rangeIn, fullTimeSpan);
   togDiv.append(smTogDiv);
   repeatSpan.append(document.createTextNode("إعادة"));
   lab.append(swithIn, togDiv);
   smallSwitchDiv.append(repeatSpan, lab);
   switchDiv.append(smallSwitchDiv);
   titreDiv.append(arH, frH);
   headDiv.append(titreDiv, switchDiv);
   lecDiv.append(headDiv, progDiv, ctrlDiv);
   global.append(lecDiv);

   swithIn.type = "checkbox";
   rangeIn.type = "range";

   audio.currentTime = 0;

   await fetch(`https://api.quran.com/api/v4/chapter_recitations/2/${soura}`, {
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
         console.log(data);
         console.log(data.audio_file.audio_url);

         audio.src = data.audio_file.audio_url;
         audioReload(audio, fullTimeSpan);
         playi.classList.add("fa-play");
         playi.classList.remove("fa-pause");
         playi.classList.remove("fa-rotate-left");
         audio.currentTime = 0;

         audio.addEventListener("timeupdate", () => {
            rangeIn.value = (audio.currentTime * 100) / audio.duration;
            currTimeSpan.textContent = formatTime(audio.currentTime);

            if (audio.currentTime === audio.duration && swithIn.checked) {
               audio.currentTime = 0;
               audio.play();
            } else if (audio.currentTime === audio.duration) {
               audio.currentTime = 0;
               playi.classList.remove("fa-pause");
               playi.classList.add("fa-rotate-left");
            }
         });
      });
}

async function audioReload(audio, fullTimeSpan) {
   audio.addEventListener("loadedmetadata", async () => {
      audio.classList.add("audio");
      fullTimeSpan.textContent = "";
      audio.currentTime = 0;
      fullTimeSpan.append(document.createTextNode(formatTime(audio.duration)));
   });
}
