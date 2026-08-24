/**
 * Bounding box del contenuto opaco dentro ogni PNG/GIF ufficiale.
 * Formato: [canvasW, canvasH, offsetX, offsetY, contentW, contentH]
 * Serve a scalare gli sprite in base al DISEGNO reale (non al canvas
 * trasparente) e a eliminare i vuoti attorno a scritte e cifre.
 */
export const BBOX: Record<string, [number, number, number, number, number, number]> = {
  "barrier.png": [64, 64, 30, 0, 3, 64],
  "bone.png": [28, 28, 1, 10, 26, 9],
  "cat-1.png": [38, 38, 4, 9, 33, 21],
  "cat-2.png": [38, 38, 4, 10, 33, 21],
  "cat.gif": [38, 38, 4, 9, 33, 21],
  "dog-game-1.png": [32, 32, 7, 8, 18, 17],
  "dog-game-2.png": [32, 32, 4, 8, 21, 17],
  "dog-game.gif": [28, 28, 2, 6, 21, 17],
  "dog-menu-1.png": [32, 32, 7, 8, 18, 17],
  "dog-menu-2.png": [32, 32, 7, 8, 21, 17],
  "dog-menu.gif": [28, 28, 5, 6, 21, 17],
  "dog-shoot.png": [28, 28, 5, 6, 18, 17],
  "explosion1.png": [32, 32, 8, 9, 16, 14],
  "explosion2.png": [32, 32, 4, 6, 24, 20],
  "hand-tutorial.png": [32, 32, 7, 4, 18, 24],
  "title-playdog.png": [64, 64, 8, 8, 48, 49],
  "word-high-score.png": [48, 48, 11, 19, 27, 8],
  "word-menu.png": [48, 48, 5, 19, 38, 8],
  "word-options.png": [48, 48, 1, 19, 45, 9],
  "word-play.png": [32, 32, 4, 11, 24, 10],
  "word-score.png": [48, 48, 3, 19, 41, 8],
  "digit.png": [32, 32, 12, 10, 7, 10],
};

for (const d of ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
  BBOX[`digit-${d}.png`] = [32, 32, 12, 10, 7, 10];
  BBOX[`digit-${d}-yellow.png`] = [32, 32, 12, 10, 7, 10];
}

// Integrazione per i tuoi file personalizzati
const MAPPING: Record<string, [number, number, number, number, number, number]> = {
  "AnnoingDog.gif": [50, 50, 9, 6, 30, 30],
  "AnnoingDoginPartita.gif": [32, 32, 4, 8, 19, 19],
  "AnnoingDogSpritePartita1.png": [37, 37, 7, 10, 19, 19],
  "AnnoingDogSpritePartita2.png": [37, 37, 7, 10, 19, 19],
  "AnnoingDogBoccaAperta.png": [32, 32, 4, 8, 19, 19],
  "NyanCat.gif": [38, 38, 4, 9, 33, 21],
  "NyanCatSprite1.png": [38, 38, 4, 9, 33, 21],
  "NyanCatSprite2.png": [38, 38, 4, 10, 33, 21],
  "Osso.png": [28, 28, 1, 10, 26, 9],
  "Esplosione1.png": [32, 32, 6, 6, 20, 20],
  "Esplosione2.png": [32, 32, 6, 6, 20, 20],
  "ManoTutoria.png": [32, 32, 7, 4, 18, 24],
  "BarrieraRossa.png": [64, 64, 30, 0, 3, 64],
  "PlayDogTitolo.png": [64, 64, 8, 8, 48, 49],
  "Playscritta.png": [32, 32, 4, 11, 24, 10],
  "Optionsscritta.png": [48, 48, 1, 19, 45, 9],
  "Highscritta.png": [48, 48, 11, 19, 27, 8],
  "Scorescritta.png": [48, 48, 3, 19, 41, 8],
  "Menuscritta.png": [48, 48, 5, 19, 38, 8],
};

// Aggiungi le cifre al mapping
for (let i = 0; i <= 9; i++) {
  MAPPING[`${i}.png`] = [32, 32, 12, 10, 7, 10];
  MAPPING[`${i}Giallo.png`] = [32, 32, 12, 10, 7, 10];
}

export function bboxOf(src: string) {
  if (!src || typeof src !== "string") return undefined;
  const name = src.split("/").pop() ?? "";
  return MAPPING[name] || BBOX[name];
}