const globDiv = document.getElementById("global");
const searchBar = document.getElementById("searchBar");

window.addEventListener("load", async () => {
   const response = await fetch(`https://api.quran.com/api/v4/chapters`, {
      method: "GET",
      headers: {
         "Content-Type": "application/json",
      },
   });
   if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut : ${response.status}`);
   }
   const data = await response.json();

   srtDisplay(data.chapters);

   // let lecBtns = document.querySelectorAll(".btn");
   // lecture(lecBtns);
});

searchBar.addEventListener("input", () => {
   let sowar = document.querySelectorAll(".soura");
   const input = searchBar.value;

   sowar.forEach((soura) => {
      let arTitre = soura.firstChild.firstChild.textContent;
      let frTitre = soura.firstChild.lastChild.textContent.toLocaleLowerCase();

      if (arTitre.includes(input) || frTitre.includes(input.toLocaleLowerCase())) {
         soura.classList.remove("hidden");
      } else {
         soura.classList.add("hidden");
      }
   });
});
