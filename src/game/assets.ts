/**
 * REGISTRO ASSET — file ufficiali del gioco (CDN Lovable Assets).
 * Ogni voce punta al relativo `.asset.json`; se una voce è `null`
 * il gioco usa un fallback provvisorio.
 */


// Importazione dei file .asset.json originali di Lovable
// (che ora leggono le tue immagini locali tramite il parametro "url" che abbiamo modificato nel JSON)

import dogMenuGifAsset from "@/assets/sprites/dog-menu.gif.asset.json";
import dogGameGifAsset from "@/assets/sprites/dog-game.gif.asset.json";
import dogShootAsset from "@/assets/sprites/dog-shoot.png.asset.json";
import catGifAsset from "@/assets/sprites/cat.gif.asset.json";
import cat1Asset from "@/assets/sprites/cat-1.png.asset.json";
import cat2Asset from "@/assets/sprites/cat-2.png.asset.json";
import dogGame1Asset from "@/assets/sprites/dog-game-1.png.asset.json";
import dogGame2Asset from "@/assets/sprites/dog-game-2.png.asset.json";
import boneAsset from "@/assets/sprites/bone.png.asset.json";
import barrierAsset from "@/assets/sprites/barrier.png.asset.json";
import boom1Asset from "@/assets/sprites/explosion1.png.asset.json";
import boom2Asset from "@/assets/sprites/explosion2.png.asset.json";

import titlePlayDogAsset from "@/assets/ui/title-playdog.png.asset.json";
import wordPlayAsset from "@/assets/ui/word-play.png.asset.json";
import wordOptionsAsset from "@/assets/ui/word-options.png.asset.json";
import wordMenuAsset from "@/assets/ui/word-menu.png.asset.json";
import wordHighAsset from "@/assets/ui/word-high-score.png.asset.json";
import wordScoreAsset from "@/assets/ui/word-score.png.asset.json";
import handTutorialAsset from "@/assets/ui/hand-tutorial.png.asset.json";

import d0A from "@/assets/digits/digit-0.png.asset.json";
import d1A from "@/assets/digits/digit-1.png.asset.json";
import d2A from "@/assets/digits/digit-2.png.asset.json";
import d3A from "@/assets/digits/digit-3.png.asset.json";
import d4A from "@/assets/digits/digit-4.png.asset.json";
import d5A from "@/assets/digits/digit-5.png.asset.json";
import d6A from "@/assets/digits/digit-6.png.asset.json";
import d7A from "@/assets/digits/digit-7.png.asset.json";
import d8A from "@/assets/digits/digit-8.png.asset.json";
import d9A from "@/assets/digits/digit-9.png.asset.json";

import y0A from "@/assets/digits/digit-0-yellow.png.asset.json";
import y1A from "@/assets/digits/digit-1-yellow.png.asset.json";
import y2A from "@/assets/digits/digit-2-yellow.png.asset.json";
import y3A from "@/assets/digits/digit-3-yellow.png.asset.json";
import y4A from "@/assets/digits/digit-4-yellow.png.asset.json";
import y5A from "@/assets/digits/digit-5-yellow.png.asset.json";
import y6A from "@/assets/digits/digit-6-yellow.png.asset.json";
import y7A from "@/assets/digits/digit-7-yellow.png.asset.json";
import y8A from "@/assets/digits/digit-8-yellow.png.asset.json";
import y9A from "@/assets/digits/digit-9-yellow.png.asset.json";

import music from "@/assets/sounds/music-dogsong.mp3.asset.json";
import shoot from "@/assets/sounds/shoot.wav.asset.json";
import bark from "@/assets/sounds/bark.mp3.asset.json";

export const dogMenuGif = { ...dogMenuGifAsset, url: "/assets/images/AnnoingDog.gif" };

const getUrl = (path: string) => `${import.meta.env.BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

export const IMAGES: Record<string, any> = {
  dogIdle: { ...dogMenuGifAsset, url: getUrl("assets/images/AnnoingDog.gif") },
  dogIdle2: { ...dogMenuGifAsset, url: getUrl("assets/images/AnnoingDog.gif") },
  dogGame: { ...dogGameGifAsset, url: getUrl("assets/images/AnnoingDoginPartita.gif") },
  dogGame1: { ...dogGame1Asset, url: getUrl("assets/images/AnnoingDogSpritePartita1.png") },
  dogGame2: { ...dogGame2Asset, url: getUrl("assets/images/AnnoingDogSpritePartita2.png") },
  dogShoot: { ...dogShootAsset, url: getUrl("assets/images/AnnoingDogBoccaAperta.png") },
  cat: { ...catGifAsset, url: getUrl("assets/images/NyanCat.gif") },
  cat1: { ...cat1Asset, url: getUrl("assets/images/NyanCatSprite1.png") },
  cat2: { ...cat2Asset, url: getUrl("assets/images/NyanCatSprite2.png") },
  bone: { ...boneAsset, url: getUrl("assets/images/Osso.png") },
  explosion1: { ...boom1Asset, url: getUrl("assets/images/Esplosione1.png") },
  explosion2: { ...boom2Asset, url: getUrl("assets/images/Esplosione2.png") },
  handTap: { ...handTutorialAsset, url: getUrl("assets/images/ManoTutoria.png") },
  handSwipe: { ...handTutorialAsset, url: getUrl("assets/images/ManoTutoria.png") },
  background: null,
  barrier: { ...barrierAsset, url: getUrl("assets/images/BarrieraRossa.png") },
  titlePlayDog: { ...titlePlayDogAsset, url: getUrl("assets/images/PlayDogTitolo.png") },
  wordPlay: { ...wordPlayAsset, url: getUrl("assets/images/Playscritta.png") },
  wordOptions: { ...wordOptionsAsset, url: getUrl("assets/images/Optionsscritta.png") },
  wordHigh: { ...wordHighAsset, url: getUrl("assets/images/Highscritta.png") },
  wordScore: { ...wordScoreAsset, url: getUrl("assets/images/Scorescritta.png") },
  wordHighScore: null,
  wordGameOver: null,
  wordRetry: null,
  wordMenu: { ...wordMenuAsset, url: getUrl("assets/images/Menuscritta.png") },
  wordContinue: null,
  wordMusic: null,
  wordSfx: null,
  wordBack: { ...wordMenuAsset, url: getUrl("assets/images/Menuscritta.png") },
  wordResetTutorial: null,
  digits: {
    "0": { ...d0A, url: getUrl("assets/images/0.png") },
    "1": { ...d1A, url: getUrl("assets/images/1.png") },
    "2": { ...d2A, url: getUrl("assets/images/2.png") },
    "3": { ...d3A, url: getUrl("assets/images/3.png") },
    "4": { ...d4A, url: getUrl("assets/images/4.png") },
    "5": { ...d5A, url: getUrl("assets/images/5.png") },
    "6": { ...d6A, url: getUrl("assets/images/6.png") },
    "7": { ...d7A, url: getUrl("assets/images/7.png") },
    "8": { ...d8A, url: getUrl("assets/images/8.png") },
    "9": { ...d9A, url: getUrl("assets/images/9.png") },
  },
  digitsYellow: {
    "0": { ...y0A, url: getUrl("assets/images/0Giallo.png") },
    "1": { ...y1A, url: getUrl("assets/images/1Giallo.png") },
    "2": { ...y2A, url: getUrl("assets/images/2Giallo.png") },
    "3": { ...y3A, url: getUrl("assets/images/3Giallo.png") },
    "4": { ...y4A, url: getUrl("assets/images/4Giallo.png") },
    "5": { ...y5A, url: getUrl("assets/images/5Giallo.png") },
    "6": { ...y6A, url: getUrl("assets/images/6Giallo.png") },
    "7": { ...y7A, url: getUrl("assets/images/7Giallo.png") },
    "8": { ...y8A, url: getUrl("assets/images/8Giallo.png") },
    "9": { ...y9A, url: getUrl("assets/images/9Giallo.png") },
  },
  percent: null,
};

export const SOUNDS = {
  music: getUrl("assets/sounds/Toby Fox - DogSong.mp3"),
  shoot: getUrl("assets/sounds/Sparo osso.wav"),
  explosion: null,
  bark: getUrl("assets/sounds/Suono Abbaio.mp3"),
};