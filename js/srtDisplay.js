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

      bigDiv.classList.add("front", "rounded-xl", "shadow-md", "px-3", "pb-2", "pt-4", "gap-y-10", "text-xl", "soura");
      titreDiv.classList.add("my-3", "text-center", "font-semibold");
      arH.classList.add("arTitre", "text-2xl");
      frH.classList.add("frTitre", "text-xl");
      versesDiv.classList.add("flex", "justify-between", "text-lg");
      placeDiv.classList.add("flex", "justify-between", "text-lg");
      btnDiv.classList.add("btn", "my-3", "w-full", "flex", "justify-center", "bg-green-600", "rounded-full");
      lecBtn.classList.add("bn632-hover", "bn25", "flex", "justify-center", "py-1", "px-14", "text-xl", "text-white", "cursor-pointer", "select-none");
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

      lecBtn.append(document.createTextNode("قراءة"));

      btnDiv.append(lecBtn);
      placeDiv.append(arPlacePara, frPlacePara);
      versesDiv.append(vArPara, vPara, vFrPara);
      titreDiv.append(arH, frH);
      bigDiv.append(titreDiv, versesDiv, placeDiv, btnDiv);

      bigDiv.id = soura.id;

      globDiv.append(bigDiv);
   });
   return sourats;
}
