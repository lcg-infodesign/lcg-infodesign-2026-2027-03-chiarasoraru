// Variabili condivise: i valori letti qui possono essere usati da più funzioni.
let data;
let maxNati = 0;
 
// Margine attorno al grafico
let margin = 40;
 
// Anni
let years = ["2020", "2021", "2022", "2023"];
 
// Direzione di ogni petalo
let angles = [-90, 0, 90, 180];
 
// Ogni anno un colore
let colorScale = {
  '2020': '#C9B1E0',
  '2021': '#EBD84B',
  '2022': '#F0645A',
  '2023': '#8FB04A'
}
 
async function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
 
  data = await loadTable("assets/nascite.csv", ",", "header");
 
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    for (let i = 0; i < 4; i++) {
      let natiAnno = data.getNum(rowNumber, years[i]);
 
      if (natiAnno > maxNati) {
        maxNati = natiAnno;
      }
    }
  }
}
 
function draw() {
  background(30, 36, 60);
 
  noStroke();
 
  // Titolo
  fill(255);
  textSize(28);
  text("La natalità europea", margin, margin + 24);
  textSize(14);
  text("Bambini nati da madri di 25-34 anni in 37 paesi", margin, margin + 52);
  text("europei tra il 2020 e il 2023", margin, margin + 70);
 
  // Legenda: un fiore ha 4 petali, uno per anno; ogni anno ha il suo colore e la sua direzione.
  let xLegenda = width - margin - 440;
 
  // Riquadro dietro la legenda
  fill(45, 52, 88);
  rect(xLegenda - 16, margin - 6, 412, 144);
 
  textSize(13);
  fill(255);
  text("Legenda:", xLegenda, margin + 14);
  text("Ogni fiore è un paese: più nati ha, più è grande.", xLegenda, margin + 34);
  text("Ogni petalo è un anno.", xLegenda, margin + 52);
  text("Il petalo più lungo è l'anno con più nati.", xLegenda, margin + 70);
  text("Passa il mouse su un fiore per vedere i numeri.", xLegenda, margin + 88);
  fill(colorScale["2020"]);
  circle(xLegenda + 6, margin + 114, 12);
  text("2020 su", xLegenda + 18, margin + 119);
  fill(colorScale["2021"]);
  circle(xLegenda + 96, margin + 114, 12);
  text("2021 destra", xLegenda + 108, margin + 119);
  fill(colorScale["2022"]);
  circle(xLegenda + 206, margin + 114, 12);
  text("2022 giù", xLegenda + 218, margin + 119);
  fill(colorScale["2023"]);
  circle(xLegenda + 296, margin + 114, 12);
  text("2023 sinistra", xLegenda + 308, margin + 119);
 
  // Un fiore per ogni riga del CSV
  let numeroPaesi = data.getRowCount();
  let numeroColonne = 10;
  let numeroRighe = 4;
  let dimColonna = (width - 2 * margin) / numeroColonne;
  let dimRiga = (height - 230 - margin) / numeroRighe;
 
  // dimensione del fiore --> lato più piccolo della cella.
  let dimCella = dimRiga;
  if (dimColonna < dimRiga) {
    dimCella = dimColonna;
  }
 
  // Lunghezza massima e minima del petalo
  let maxLength = dimCella / 2 - 10;
  let minLength = maxLength * 0.35;
 
  // rigaSelezionata è la riga del CSV sotto il mouse; -1 se il mouse non è sopra nessun fiore
  let rigaSelezionata = -1;
 
  let xCorrente = margin;
  let yCorrente = 230;
 
  // Ogni riga del CSV diventa un fiore.
  for (let rowNumber = 0; rowNumber < numeroPaesi; rowNumber++) {
    let code = data.getString(rowNumber, "Codice");
 
    // Sigla del paese nell'angolo della cella.
    fill(45, 52, 88);
    rect(xCorrente + 6, yCorrente + 14, 28, 22);
    fill(255);
    textSize(12);
    text(code, xCorrente + 12, yCorrente + 30);
 
    // Nati dei 4 anni di questo paese, e valore più alto e più basso tra i 4 anni.
    let nati = [];
    let natiMax = 0;
    let natiMin = maxNati;
    for (let i = 0; i < 4; i++) {
      let natiAnno = data.getNum(rowNumber, years[i]);
      nati.push(natiAnno);
      if (natiAnno > natiMax) {
        natiMax = natiAnno;
      }
      if (natiAnno < natiMin) {
        natiMin = natiAnno;
      }
    }
 
    // La dimensione del fiore dipende dai nati del paese.
    let lunghezzaMax = map(natiMax, 0, maxNati, minLength, maxLength);
 
    // L'anno con più nati ha il petalo lungo quanto il fiore,
    // l'anno con meno nati ha il petalo lungo il 50% del fiore, gli altri stanno in mezzo.
    let lunghezze = [];
    for (let i = 0; i < 4; i++) {
      lunghezze.push(map(nati[i], natiMin, natiMax, lunghezzaMax * 0.5, lunghezzaMax));
    }
 
    // Fiore al centro della cella (un po' più in basso per lasciare spazio alla sigla).
    mioFiore(xCorrente + 0.5 * dimColonna, yCorrente + 0.5 * dimRiga + 6, dimCella, lunghezze);
 
    // Verifica se il puntatore si trova dentro questa cella e memorizza la riga corrispondente.
    if (
      mouseX >= xCorrente &&
      mouseX <= xCorrente + dimColonna &&
      mouseY >= yCorrente &&
      mouseY <= yCorrente + dimRiga
    ) {
      rigaSelezionata = rowNumber;
    }
 
    // Passa alla cella successiva
    xCorrente = xCorrente + dimColonna;
    if (xCorrente >= width - margin - 1) {
      yCorrente = yCorrente + dimRiga;
      xCorrente = margin;
    }
  }
 
  // Mostra paese e nati vicino al puntatore solo quando questo si trova sopra un fiore.
  if (rigaSelezionata != -1) {
    // Riquadro scuro dietro il testo
    fill(15, 18, 35);
    rect(mouseX + 8, mouseY + 8, 130, 92);
 
    textSize(14);
    fill(255);
    text(data.getString(rigaSelezionata, "Paese"), mouseX + 16, mouseY + 28);
    textSize(12);
    for (let i = 0; i < 4; i++) {
      fill(colorScale[years[i]]);
      text(years[i] + ": " + data.getNum(rigaSelezionata, years[i]), mouseX + 16, mouseY + 46 + i * 15);
    }
  }
}
 
// Fiore con 4 petali (ellissi) che partono dal centro
function mioFiore(_x, _y, _size, _lunghezze) {
  push();
  translate(_x, _y);
 
  // Un petalo per anno: si ruota e si disegna un'ellisse che parte dal centro
  for (let i = 0; i < 4; i++) {
    push();
    rotate(angles[i]);
    fill(colorScale[years[i]]);
    ellipse(_lunghezze[i] / 2, 0, _lunghezze[i], _lunghezze[i] * 0.62);
    pop();
  }
 
  // Centro del fiore
  fill(255);
  circle(0, 0, _size * 0.08);
 
  pop();
}