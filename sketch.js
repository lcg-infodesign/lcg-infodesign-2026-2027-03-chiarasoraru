// Variabili condivise: i valori letti qui possono essere usati da più funzioni.
let data;
let maxNati = 0;
 
// Margine attorno al grafico
let margin = 40;
 
// Anni (come testo, uguali ai nomi delle colonne del CSV)
let years = ["2020", "2021", "2022", "2023"];
 
// Direzione di ogni pala
let angles = [-90, 0, 90, 180];
 
// Ogni anno un colore
let colorScale = {
  2020: '#C9B1E0',
  2021: '#EBD84B',
  2022: '#F0645A',
  2023: '#8FB04A'
}
 
async function setup() {
  createCanvas(windowWidth, windowHeight);
 
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
  text("Bambini nati da madri di 25-34 anni", margin, margin + 52);
  text("in 37 paesi europei tra il 2020 e il 2023", margin, margin + 70);
 
  // Legenda: una girandola ha 4 pale, uno per anno; ogni anno ha il suo colore e la sua direzione.
  let xLegenda = width - 420;
  textSize(13);
  fill(255);
  text("Legenda:", xLegenda, margin + 14);
  text("Ogni girandola è un paese.", xLegenda, margin + 34);
  text("Ogni Pala è un anno.", xLegenda, margin + 52);
  text("La lunghezza della pala corrisponde ai nati in quell'anno.", xLegenda, margin + 72);
  text("Più nati ha il paese, più grande è la girandola.", xLegenda, margin + 90);
  text("Nella girandola, la pala più lunga è l'anno con più nati.", xLegenda, margin + 108);
  fill(colorScale[2020]);
  circle(xLegenda + 6, margin + 126, 12);
  text("2020 su", xLegenda + 18, margin + 131);
  fill(colorScale[2021]);
  circle(xLegenda + 96, margin + 126, 12);
  text("2021 destra", xLegenda + 108, margin + 131);
  fill(colorScale[2022]);
  circle(xLegenda + 206, margin + 126, 12);
  text("2022 giù", xLegenda + 218, margin + 131);
  fill(colorScale[2023]);
  circle(xLegenda + 296, margin + 126, 12);
  text("2023 sinistra", xLegenda + 308, margin + 131);
 
  // Una girandola per ogni riga del CSV
  let numeroPaesi = data.getRowCount();
  let numeroColonne = 10;
  let numeroRighe = ceil(numeroPaesi / numeroColonne);
  let dimColonna = (width - 2 * margin) / numeroColonne;
  let dimRiga = (height - 230 - margin) / numeroRighe;
 
  //dimensione della girandola --> lato più piccolo della cella.
  let dimCella = dimRiga;
  if (dimColonna < dimRiga) {
    dimCella = dimColonna;
  }
 
  // Lunghezza massima e minima della pala
  let maxLength = dimCella / 2 - 10;
  let minLength = maxLength * 0.35;
 
  // rigaSelezionata contiene la riga del CSV sotto il mouse (-1 = nessuna)
  let rigaSelezionata = -1;
 
  let xCorrente = margin;
  let yCorrente = 230;
 
  // Ogni riga del CSV diventa una girandola.
  for (let rowNumber = 0; rowNumber < numeroPaesi; rowNumber++) {
    let code = data.getString(rowNumber, "Codice");
 
    // Sigla del paese nell'angolo della cella.
    fill(160, 170, 200);
    textSize(11);
    text(code, xCorrente + 6, yCorrente + 30);
 
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
 
    // La dimensione della girandola dipende dai nati del paese.
    let lunghezzaMax = map(natiMax, 0, maxNati, minLength, maxLength);
 
    //l'anno con più nati ha il la pala lunga quanto la girandola,
    // l'anno con meno nati ha il pala lunga il 50% della girandola, gli altri stanno in mezzo.
    let lunghezze = [];
    for (let i = 0; i < 4; i++) {
      lunghezze.push(map(nati[i], natiMin, natiMax, lunghezzaMax * 0.5, lunghezzaMax));
    }
 
    // Girandola al centro della cella (un po' più in basso per lasciare spazio alla sigla).
    mioGirandola(xCorrente + 0.5 * dimColonna, yCorrente + 0.5 * dimRiga + 6, dimCella, lunghezze);
 
    // Verifica se il puntatore si trova dentro questa cella e salva la riga.
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
 
  // Mostra paese e nati vicino al puntatore solo quando questo si trova sopra una girandola.
  if (rigaSelezionata >= 0) {
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
 
// Girandola con 4 pale (triangoli) che partono dal centro
function mioGirandola(_x, _y, _size, _lunghezze) {
  push();
  translate(_x, _y);
  angleMode(DEGREES);
 
  // Una pala per anno: si ruota e si disegna un triangolo con un vertice al centro
  for (let i = 0; i < 4; i++) {
    push();
    rotate(angles[i]);
    fill(colorScale[years[i]]);
    triangle(0, 0, _lunghezze[i], 0, _lunghezze[i], _lunghezze[i] * 0.7);
    pop();
  }
 
  // Perno della girandola
  fill(255);
  circle(0, 0, _size * 0.08);
 
  pop();
}