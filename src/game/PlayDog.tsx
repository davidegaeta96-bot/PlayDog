import { useCallback, useEffect, useRef, useState } from "react";
import { IMAGES } from "./assets";
import { audio } from "./audio";
import { Sprite } from "./sprites";
import { PixelImg, SpriteNumber, SpriteWord } from "./SpriteText";

/* ---------------- costanti di gioco ---------------- */
const W = 800;
const H = 450;
const DOG_SIZE = 66;
const DOG_W = 70;
const DOG_MENU_H = 100;
const DOG_MENU_W = 100;
const DOG_X = 64;
const CAT_SIZE = 64;
const CAT_W = 100;
const BONE_W = 48;
const BONE_H = 17;
const BONE_SPEED = 640;
const BARRIER_X = 26;
const SHOOT_COOLDOWN = 150;
const SHOOT_ANIM = 150;
const DOG_FRAME_MS = 200; // GIF cane a 5 FPS
const CAT_FRAME_MS = 250; // GIF Nyan Cat a 4 FPS
const BOOM_FRAME_MS = 120;
const BOOM_LIFE_MS = 320;
const PREP_DELAY = 5000;
const CONTINUE_DELAY = 1500;
const DIFF_STEP_MS = 15000;
const MAX_LEVEL = 8; // limite massimo raggiunto a 125s
const BASE_SPEED = 150;
const SPEED_STEP = 30;
const BASE_SPAWN = 1500;
const SPAWN_STEP = 130;
const MIN_SPAWN = 460;

const LS_TUTORIAL = "playdog_tutorial_done";
const LS_HIGH = "playdog_highscore";
const LS_MUSIC = "playdog_music_volume";
const LS_SFX = "playdog_sfx_volume";

type Screen = "menu" | "options" | "playing" | "gameover" | "ad";
type Cat = { id: number; x: number; y: number };
type Bone = { id: number; x: number; y: number };
type Boom = { id: number; x: number; y: number; t0: number };

let idSeq = 1;
const nextId = () => idSeq++;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ---------------- blocco landscape ---------------- */
function useStageTransform() {
  const [t, setT] = useState({ scale: 1, rotate: false });
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rotate = vh > vw;
      const aw = rotate ? vh : vw;
      const ah = rotate ? vw : vh;
      setT({ scale: Math.min(aw / W, ah / H), rotate });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);
  return t;
}

export default function PlayDog() {
  const { scale, rotate } = useStageTransform();

  const [screen, setScreen] = useState<Screen>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [musicVol, setMusicVol] = useState(0.5);
  const [sfxVol, setSfxVol] = useState(0.5);

  const [dogY, setDogY] = useState(H / 2);
  const [cats, setCats] = useState<Cat[]>([]);
  const [bones, setBones] = useState<Bone[]>([]);
  const [booms, setBooms] = useState<Boom[]>([]);
  const [shooting, setShooting] = useState(false);
  const [tutorial, setTutorial] = useState<0 | 1 | 2>(0);
  const [continueUsed, setContinueUsed] = useState(false);

  const dogYRef = useRef(H / 2);
  const catsRef = useRef<Cat[]>([]);
  const bonesRef = useRef<Bone[]>([]);
  const boomsRef = useRef<Boom[]>([]);
  const screenRef = useRef<Screen>("menu");
  const tutorialRef = useRef<0 | 1 | 2>(0);
  const runStartRef = useRef(0);
  const spawnAtRef = useRef(Infinity);
  const nextSpawnRef = useRef(0);
  const lastShotRef = useRef(0);
  const shootTimerRef = useRef<number | null>(null);
  const dogAnimRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const highRef = useRef(0);
  const pointers = useRef<
    Map<number, { startX: number; startY: number; dogY: number; moved: boolean }>
  >(new Map());

  screenRef.current = screen;
  tutorialRef.current = tutorial;

  /* ---------------- avvio: LS + musica ---------------- */
  useEffect(() => {
    const h = Number(localStorage.getItem(LS_HIGH) ?? 0);
    const mv = localStorage.getItem(LS_MUSIC);
    const sv = localStorage.getItem(LS_SFX);
    const m = mv === null ? 0.5 : Number(mv);
    const s = sv === null ? 0.5 : Number(sv);
    setHighScore(h);
    highRef.current = h;
    setMusicVol(m);
    setSfxVol(s);
    audio.setMusicVolume(m);
    audio.setSfxVolume(s);
    audio.startMusic(true);
    const unlock = () => audio.startMusic(false);
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  /* congelamento frame al game over: le GIF (2 frame) vengono sostituite
     dalle PNG statiche in base al numero intero di intervalli trascorsi */
  const [frozenDog, setFrozenDog] = useState<string | null>(null);
  const [frozenCat, setFrozenCat] = useState<string | null>(null);
  const shootingRef = useRef(false);
  shootingRef.current = shooting;

  const applyMusicVol = (v: number) => {
    setMusicVol(v);
    localStorage.setItem(LS_MUSIC, String(v));
    audio.setMusicVolume(v);
  };
  const applySfxVol = (v: number) => {
    setSfxVol(v);
    localStorage.setItem(LS_SFX, String(v));
    audio.setSfxVolume(v);
  };

  /* ---------------- sparo ---------------- */
  const shoot = useCallback(() => {
    const now = performance.now();
    if (now - lastShotRef.current < SHOOT_COOLDOWN) return;
    lastShotRef.current = now;
    bonesRef.current = [
      ...bonesRef.current,
      { id: nextId(), x: DOG_X + DOG_SIZE - 8, y: dogYRef.current },
    ];
    setBones(bonesRef.current);
    audio.playSfx("shoot");
    setShooting(true);
    if (shootTimerRef.current) window.clearTimeout(shootTimerRef.current);
    shootTimerRef.current = window.setTimeout(() => setShooting(false), SHOOT_ANIM);
  }, []);

  /* ---------------- partita ---------------- */
  const startRun = useCallback(() => {
    catsRef.current = [];
    setFrozenDog(null);
    setFrozenCat(null);
    bonesRef.current = [];
    boomsRef.current = [];
    setCats([]);
    setBones([]);
    setBooms([]);
    setScore(0);
    scoreRef.current = 0;
    setContinueUsed(false);
    setShooting(false);
    if (shootTimerRef.current) {
      window.clearTimeout(shootTimerRef.current);
      shootTimerRef.current = null;
    }
    dogYRef.current = H / 2;
    setDogY(H / 2);
    runStartRef.current = performance.now();
    const firstTime = !localStorage.getItem(LS_TUTORIAL);
    if (firstTime) {
      setTutorial(1);
      spawnAtRef.current = Infinity;
    } else {
      setTutorial(0);
      spawnAtRef.current = performance.now() + PREP_DELAY;
    }
    nextSpawnRef.current = 0;
    setScreen("playing");
    audio.startMusic(true); // musica da 0:00
  }, []);

  const finishTutorial = useCallback(() => {
    localStorage.setItem(LS_TUTORIAL, "1");
    setTutorial(0);
    runStartRef.current = performance.now();
    spawnAtRef.current = performance.now() + PREP_DELAY;
  }, []);

  const gameOver = useCallback(() => {
    audio.pauseMusic(); // conserva la posizione per 'Continue'
    audio.playSfx("bark");
    // frame esatto al millesimo: pari/dispari sugli intervalli della GIF
    const now = performance.now();
    const elapsed = now - runStartRef.current;
    const dogSteps = Math.floor(elapsed / DOG_FRAME_MS);
    const catSteps = Math.floor(elapsed / CAT_FRAME_MS);
    setFrozenDog(
      shootingRef.current
        ? IMAGES.dogShoot // eccezione: muore a bocca aperta
        : dogSteps % 2 === 1
          ? IMAGES.dogGame1
          : IMAGES.dogGame2,
    );
    setFrozenCat(catSteps % 2 === 1 ? IMAGES.cat1 : IMAGES.cat2);
    if (shootTimerRef.current) {
      window.clearTimeout(shootTimerRef.current);
      shootTimerRef.current = null;
    }
    if (scoreRef.current > highRef.current) {
      highRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
      localStorage.setItem(LS_HIGH, String(scoreRef.current));
    }
    setScreen("gameover");
  }, []);

  /* ---------------- game loop ---------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (screenRef.current !== "playing") return;

      const elapsed = now - runStartRef.current;
      const level = Math.min(MAX_LEVEL, Math.floor(elapsed / DIFF_STEP_MS));
      const catSpeed = BASE_SPEED + SPEED_STEP * level;
      const spawnEvery = Math.max(MIN_SPAWN, BASE_SPAWN - SPAWN_STEP * level);

      // spawn
      if (tutorialRef.current === 0 && now >= spawnAtRef.current) {
        if (now >= nextSpawnRef.current) {
          nextSpawnRef.current = now + spawnEvery;
          const y = (5 + Math.random() * 90) / 100 * H;
          catsRef.current = [...catsRef.current, { id: nextId(), x: W + CAT_SIZE, y }];
        }
      }

      // movimento
      let cats2 = catsRef.current.map((c) => ({ ...c, x: c.x - catSpeed * dt }));
      let bones2 = bonesRef.current
        .map((b) => ({ ...b, x: b.x + BONE_SPEED * dt }))
        .filter((b) => b.x < W + 40);

      // collisioni osso/gatto
      const newBooms: Boom[] = [];
      const deadCats = new Set<number>();
      const deadBones = new Set<number>();
      for (const b of bones2) {
        for (const c of cats2) {
          if (deadCats.has(c.id) || deadBones.has(b.id)) continue;
          if (
            Math.abs(b.x - c.x) < (CAT_SIZE + BONE_W) / 2 &&
            Math.abs(b.y - c.y) < (CAT_SIZE + BONE_H) / 2
          ) {
            deadCats.add(c.id);
            deadBones.add(b.id);
            newBooms.push({ id: nextId(), x: c.x, y: c.y, t0: now });
          }
        }
      }
      if (deadCats.size) {
        audio.playSfx("explosion");
        scoreRef.current += deadCats.size;
        setScore(scoreRef.current);
        if (scoreRef.current > highRef.current) {
          highRef.current = scoreRef.current;
          setHighScore(scoreRef.current);
          localStorage.setItem(LS_HIGH, String(scoreRef.current));
        }
      }
      cats2 = cats2.filter((c) => !deadCats.has(c.id));
      bones2 = bones2.filter((b) => !deadBones.has(b.id));

      boomsRef.current = [...boomsRef.current, ...newBooms].filter(
        (b) => now - b.t0 < BOOM_LIFE_MS,
      );

      // game over: barriera o scontro col cane
      let over = false;
      for (const c of cats2) {
        if (c.x - CAT_SIZE / 2 <= BARRIER_X) over = true;
        if (
          Math.abs(c.x - (DOG_X + DOG_SIZE / 2)) < (CAT_SIZE + DOG_SIZE) / 2 - 12 &&
          Math.abs(c.y - dogYRef.current) < (CAT_SIZE + DOG_SIZE) / 2 - 12
        )
          over = true;
      }

      catsRef.current = cats2;
      bonesRef.current = bones2;
      setCats(cats2);
      setBones(bones2);
      setBooms(boomsRef.current);
      if (over) gameOver();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameOver]);

  /* ---------------- input touch (multi-touch) ---------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    if (screen !== "playing") return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, {
      startX: e.clientX,
      startY: e.clientY,
      dogY: dogYRef.current,
      moved: false,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    // in modalità ruotata (telefono in verticale) l'asse verticale del gioco
    // corrisponde all'asse orizzontale dello schermo
    const dy = rotate ? -(e.clientX - p.startX) / scale : (e.clientY - p.startY) / scale;
    if (Math.abs(dy) > 14) p.moved = true;
    const y = clamp(p.dogY + dy, DOG_SIZE / 2, H - DOG_SIZE / 2);
    dogYRef.current = y;
    setDogY(y);
    if (tutorialRef.current === 2 && p.moved) finishTutorial();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (screenRef.current !== "playing" || !p) return;
    if (p.moved) return; // era un trascinamento: solo movimento
    if (tutorialRef.current === 2) return; // fase movimento del tutorial
    shoot();
    if (tutorialRef.current === 1) setTutorial(2);
  };

  /* ---------------- game over actions ---------------- */
  const onRetry = () => {
    startRun();
  };
  const onMenu = () => {
    setShooting(false);
    setFrozenDog(null);
    setFrozenCat(null);
    if (shootTimerRef.current) {
      window.clearTimeout(shootTimerRef.current);
      shootTimerRef.current = null;
    }
    setScreen("menu");
    audio.startMusic(true);
  };
  const onContinue = () => {
    setContinueUsed(true);
    setFrozenDog(null);
    setFrozenCat(null);
    setScreen("ad");
    // Placeholder Rewarded Ad (Google AdMob): sostituire con la SDK reale.
    window.setTimeout(() => {
      catsRef.current = [];
      bonesRef.current = [];
      boomsRef.current = [];
      setCats([]);
      setBones([]);
      setBooms([]);
      setShooting(false);
      if (shootTimerRef.current) {
        window.clearTimeout(shootTimerRef.current);
        shootTimerRef.current = null;
      }
      spawnAtRef.current = performance.now() + CONTINUE_DELAY;
      nextSpawnRef.current = 0;
      setScreen("playing");
      audio.resumeMusic(); // riprende dal punto esatto
    }, 2000);
  };

  

  /* ---------------- render ---------------- */
  const dogImg = frozenDog ?? (shooting ? IMAGES.dogShoot : IMAGES.dogGame);
  const catImg = frozenCat ?? IMAGES.cat;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black touch-none">
      <div
        className="absolute left-1/2 top-1/2 bg-black"
        style={{
          width: W,
          height: H,
          transform: `translate(-50%, -50%) ${rotate ? "rotate(90deg)" : ""} scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {IMAGES.background && (
            <img src={IMAGES.background} alt="" className="absolute inset-0 h-full w-full" />
          )}

          {/* ---------- PARTITA ---------- */}
          {(screen === "playing" || screen === "gameover" || screen === "ad") && (
            <>
              {/* barriera rossa */}
              {IMAGES.barrier ? (
                <PixelImg
                  src={IMAGES.barrier}
                  gh={H}
                  gw={21}
                  style={{ position: "absolute", left: 8, top: 0 }}
                />
              ) : (
                <div
                  className="absolute left-0 bg-red-600"
                  style={{ top: 0, width: BARRIER_X, height: H }}
                />
              )}

              {/* punteggio in alto a destra */}
              <div className="absolute right-4 top-4 flex gap-4 text-white">
                <SpriteWord src={IMAGES.wordScore} text="Score" height={24}/>
                <SpriteNumber value={score} height={24} />
              </div>

              {/* cane */}
              <div
                className="absolute"
                style={{ left: DOG_X, top: Math.max(10, dogY - DOG_SIZE / 2) }}
              >
                <Sprite src={dogImg} fallback="🐕" w={DOG_W} h={DOG_SIZE} />
              </div>

              {/* ossa */}
              {bones.map((b) => (
                <Sprite
                  key={b.id}
                  src={IMAGES.bone}
                  fallback="🦴"
                  w={BONE_W}
                  h={BONE_H}
                  style={{
                    position: "absolute",
                    left: b.x - BONE_W / 2,
                    top: b.y - BONE_H / 2,
                  }}
                />
              ))}

              {/* gatti */}
              {cats.map((c) => (
                <Sprite
                  key={c.id}
                  src={catImg}
                  fallback="🐱"
                  w={CAT_W}
                  h={CAT_SIZE}
                  style={{
                    position: "absolute",
                    left: c.x - CAT_W / 2,
                    top: Math.max(10, Math.min(c.y - CAT_SIZE / 2, H - CAT_SIZE - 10)),
                  }}
                />
              ))}

              {/* esplosioni: frame 1 poi frame 2 dopo 0,5s */}
              {booms.map((b) => {
                const late = performance.now() - b.t0 > BOOM_FRAME_MS;
                return (
                  <Sprite
                    key={b.id}
                    src={late ? IMAGES.explosion2 : IMAGES.explosion1}
                    fallback={late ? "✨" : "💥"}
                    w={CAT_SIZE}
                    h={CAT_SIZE}
                    style={{
                      position: "absolute",
                      left: b.x - CAT_SIZE / 2,
                      top: Math.max(10, Math.min(b.y - CAT_SIZE / 2, H - CAT_SIZE - 10)),
                    }}
                  />
                );
              })}

              {/* tutorial */}
              {tutorial === 1 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <Sprite
                    src={IMAGES.handTap}
                    fallback="👆"
                    w={28}
                    h={37}
                    className="animate-[pulse_1s_ease-in-out_infinite]"
                  />
                </div>
              )}
              {tutorial === 2 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <Sprite
                    src={IMAGES.handSwipe}
                    fallback="👆"
                    w={28}
                    h={37}
                    className="animate-tutorial-swipe"
                  />
                </div>
              )}
            </>
          )}

          {/* ---------- MENU ---------- */}
          {screen === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-between px-8 py-4 text-white">
              <SpriteWord src={IMAGES.titlePlayDog} text="PlayDog" height={130} />
              <Sprite src={IMAGES.dogIdle} fallback="🐕" w={DOG_MENU_W} h={DOG_MENU_H} />
              <div className="flex w-full flex-col items-center gap-1">
                <div className="relative flex w-full items-center justify-center">
                  <button
                    onClick={startRun}
                    className="bg-transparent px-10 py-2 active:scale-95"
                  >
                    <SpriteWord src={IMAGES.wordPlay} text="Play" height={24} />
                  </button>
                  
                </div>
                <button
                  onClick={() => setScreen("options")}
                  className="bg-transparent px-10 py-2 active:scale-95"
                >
                  <SpriteWord src={IMAGES.wordOptions} text="Options" height={23} />
                </button>
              </div>
            </div>
          )}

          {/* ---------- OPTIONS ---------- */}
          {screen === "options" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-16 text-white">
              <div className="flex flex-col items-center justify-center gap-3 ml-7">
                <span className="flex items-end gap-5 mb-4">
                  <SpriteWord src={IMAGES.wordHigh} text="High" height={30} />
                  <SpriteWord src={IMAGES.wordScore} text="Score" height={30} />
                </span>
                <SpriteNumber value={highScore} height={33} yellow className="text-yellow-400" />
              </div>
              <SliderRow
                label={<SpriteWord src={IMAGES.wordMusic} text="Music" height={20} />}
                value={musicVol}
                onChange={applyMusicVol}
                rotate={rotate}
              />
              <SliderRow
                label={<SpriteWord src={IMAGES.wordSfx} text="Sfx" height={20} />}
                value={sfxVol}
                onChange={applySfxVol}
                rotate={rotate}
              />
              <button
                onClick={() => setScreen("menu")}
                className="bg-transparent px-8 py-2 active:scale-95 ml-7"
              >
                <SpriteWord src={IMAGES.wordBack} text="Menu" height={24} />
              </button>
            </div>
          )}

          {/* ---------- GAME OVER ---------- */}
          {screen === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-10 text-white">
              <SpriteWord src={IMAGES.wordGameOver} text="Game Over" height={36} className="mb-6"/>
              <div className="flex items-end gap-4">
                <SpriteWord src={IMAGES.wordScore} text="Score" height={21} />
                <SpriteNumber value={score} height={21} />
              </div>
              <div className="flex items-end gap-4 mt-1">
                <SpriteWord src={IMAGES.wordHigh} text="High" height={21} />
                <SpriteWord src={IMAGES.wordScore} text="Score" height={21} />
                <SpriteNumber value={highScore} height={21} yellow className="text-yellow-400" />
              </div>
              <div className="flex w-full flex-wrap items-center justify-center gap-4 mt-6">
                <button
                 onClick={onRetry}
                 className="px-6 py-2 active:scale-95"
                >
                <SpriteWord src={IMAGES.wordRetry} text="Retry" height={22} />
                </button>
                <button
                 onClick={onMenu}
                 className="px-6 py-2 active:scale-95"
                >
                <SpriteWord src={null} text="Menu" height={22} />
                </button>
                {!continueUsed && (
                  <button
                 onClick={onContinue}
                 className="px-6 py-2 text-yellow-300 active:scale-95"
                >
                <SpriteWord src={IMAGES.wordContinue} text="Continue" height={22} />
                </button>
                )}
              </div>
            </div>
          )}

          {/* ---------- AD placeholder ---------- */}
          {screen === "ad" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <span className="font-pixel text-sm">REWARDED AD...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  rotate,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  rotate: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromEvent = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = rotate
      ? (e.clientY - r.top) / r.height
      : (e.clientX - r.left) / r.width;
    onChange(clamp(Math.round(f * 100) / 100, 0, 1));
  };

  return (
    <div className="flex w-full max-w-[520px] items-center justify-center gap-4">
      <div className="flex w-28 justify-end">{label}</div>
      <div
        ref={trackRef}
        className="relative h-8 flex-1 cursor-pointer touch-none select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          setFromEvent(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromEvent(e);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-none bg-white/30" />
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-none bg-white"
          style={{ width: `${value * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-none bg-white"
          style={{ left: `${value * 100}%`, imageRendering: "pixelated" }}
        />
      </div>
      <div className="flex w-20 justify-start">
        <SpriteNumber value={value * 100} height={18} suffix="percent" />
      </div>
    </div>
  );
}