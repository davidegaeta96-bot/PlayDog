# Come caricare i tuoi file (da mobile)

Il modo più semplice: **allega i file direttamente in questa chat**
(icona graffetta / "+" nella barra del messaggio, max 10 file per messaggio,
20 MB ciascuno). Li salvo io nelle cartelle giuste e li collego al gioco.

Oppure, se preferisci, mettili tu qui:

- immagini PNG -> `public/assets/images/`
- suoni MP3/WAV -> `public/assets/sounds/`

Poi in `src/game/assets.ts` scrivi il percorso, es:
`dogIdle: "/assets/images/dog-idle.png"`.

## Nomi consigliati

### Immagini (`public/assets/images/`)
dog-idle.png, dog-idle2.png, dog-shoot.png, cat.png, bone.png,
explosion1.png, explosion2.png, hand-tap.png, hand-swipe.png,
background.png, barrier.png,
title-playdog.png, word-play.png, word-options.png, word-score.png,
word-highscore.png, word-gameover.png, word-retry.png, word-menu.png,
word-continue.png, word-music.png, word-sfx.png, word-back.png,
word-reset-tutorial.png,
digit-0.png ... digit-9.png, percent.png

### Suoni (`public/assets/sounds/`)
music.mp3, shoot.mp3, explosion.mp3, bark.mp3
