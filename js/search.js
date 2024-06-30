const mic = document.querySelector(".mic");
const trascDiv = document.getElementById("transc");
const resultDiv = document.getElementById("results");
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
   sowarResult = await sowarResponse.json();
   sowar = sowarResult.chapters;
});

recognition.addEventListener("result", (event) => {
   const transcript = event.results[0][0].transcript;

   for (let i = trascDiv.childNodes.length - 1; i >= 0; i--) {
      trascDiv.childNodes[i].remove();
   }

   for (let i = resultDiv.childNodes.length - 1; i >= 0; i--) {
      resultDiv.childNodes[i].remove();
   }
   let text = document.createTextNode("");
   text = document.createTextNode(transcript);
   trascDiv.append(text);
   // console.log(verses[1].text_uthmani_simple);
   verses.forEach((verse) => {
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
         para.classList.add("para", "overflow-hidden", "text-ellipsis", "whitespace-pre", "h-10");
         souraPara.classList.add("messiri-font", "text-sm");

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
   console.log("recording...");
   mic.classList.add("listening");
   for (let i = resultDiv.children.length - 1; i >= 0; i--) {
      resultDiv.children[i].remove();
   }

   resultDiv.classList.add("grid", "grid-cols-1", "text-ellipsis", "whitespace-pre", "overflow-x-hidden");
   resultDiv.classList.remove("flex", "flex-wrap", "justify-center", "bg-white", "rounded-lg", "shadow-lg");

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
      mic.lastElementChild.classList.remove("fa-microphone");
      mic.lastElementChild.classList.add("fa-stop");
   } else {
      stopRecording();
      mic.lastElementChild.classList.add("fa-microphone");
      mic.lastElementChild.classList.remove("fa-stop");
   }
});

resultDiv.addEventListener("click", async (e) => {
   if (e.target.classList.contains("rslt")) {
      console.log(e.target);
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
      let lastV = wantedSourat[wantedSourat.length - 1].id - 1;
      console.log(showVerses[firstV]);
      let bigDiv = souraDiv.parentElement;

      for (let i = bigDiv.children.length - 1; i >= 0; i--) {
         bigDiv.children[i].remove();
      }

      bigDiv.classList.remove("grid", "grid-cols-1", "text-ellipsis", "whitespace-pre", "overflow-x-hidden");
      bigDiv.classList.add("flex", "flex-wrap", "justify-center", "bg-white", "rounded-lg", "shadow-lg");

      for (let v = firstV; v <= lastV; v++) {
         let p = document.createElement("p");
         let span = document.createElement("span");

         span.classList.add("mt-1", "mx-2", "w-7", "h-7", "text-sm", "rounded-full", "border-[1px]", "border-gray-600", "flex", "justify-center");

         p.append(document.createTextNode(showVerses[v].text_uthmani));
         span.append(document.createTextNode(showVerses[v].verse_key.split(":")[1]));

         bigDiv.append(p, span);
      }
   }
});
