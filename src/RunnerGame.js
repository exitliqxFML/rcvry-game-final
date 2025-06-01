// src/RunnerGame.js
import React, { useEffect, useRef, useState, useMemo } from "react";

/* ---------- constants ---------- */
const GRAVITY     = 0.6;
const JUMP_VEL    = -12;
const DUCK_TIME   = 600;           // ms
const GROUND_LINE = 230;           // y-coord of ground
const BASE_SPEED  = 4;
const SPEED_STEP  = 1;
const STOP_Y      = 155;           // final Y for falling top obstacle

export default function RunnerGame({ onGameOver }) {
  /* ---------- refs & state ---------- */
  const canvasRef = useRef(null);

  const player = useRef({
    h: 30,
    w: 30,
    x: 60,
    y: GROUND_LINE - 30, // top-edge so feet touch ground
    vy: 0,
    jumping: false,
    ducking: false,
  });

  const obstacle = useRef({
    lane: "bottom",
    x: 400,
    y: 0,
    w: 20,
    h: 40,
    speedX: BASE_SPEED,
    speedY: 0,
    active: false,
  });

  const [score, setScore] = useState(0);

  /* ---------- sprites ---------- */
  const playerImg = useMemo(() => { const i = new Image(); i.src = "/player.png"; return i; }, []);
  const botImg    = useMemo(() => { const i = new Image(); i.src = "/obstacle.png";    return i; }, []);
  const topImg    = useMemo(() => { const i = new Image(); i.src = "/obstacleTop.png"; return i; }, []);

  /* ---------- spawn helper ---------- */
  const spawnObstacle = () => {
    const topLane = Math.random() < 0.5;
    obstacle.current.lane   = topLane ? "top" : "bottom";
    obstacle.current.x      = 400;
    obstacle.current.speedX = BASE_SPEED + SPEED_STEP * Math.floor(score / 5);

    if (topLane) {
      obstacle.current.y      = 10;
      obstacle.current.h      = 50;
      obstacle.current.speedY = 2.5 + 0.2 * Math.floor(score / 5);
    } else {
      const h = Math.floor(Math.random() * 40) + 20;
      obstacle.current.h      = h;
      obstacle.current.y      = GROUND_LINE - h;
      obstacle.current.speedY = 0;
    }
    obstacle.current.active = true;
  };

  /* ---------- controls ---------- */
  useEffect(() => {
    const onKey = (e) => {
      const p = player.current;

      /* jump */
      if ((e.code === "Space" || e.code === "ArrowUp") && !p.jumping && !p.ducking) {
        p.vy = JUMP_VEL;
        p.jumping = true;
      }

      /* duck */
      if (e.code === "ArrowDown" && !p.jumping && !p.ducking) {
        p.ducking = true;
        const originalH = p.h;
        p.h = 15;
        p.y = GROUND_LINE - p.h;        // keep feet level
        setTimeout(() => {
          p.h = originalH;
          p.y = GROUND_LINE - p.h;      // restore standing position
          p.ducking = false;
        }, DUCK_TIME);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- game loop ---------- */
  useEffect(() => {
    spawnObstacle();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let req;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* player physics */
      const p = player.current;
      p.vy += GRAVITY;
      p.y  += p.vy;
      const floorY = GROUND_LINE - p.h;
      if (p.y >= floorY) {
        p.y = floorY;
        p.vy = 0;
        p.jumping = false;
      }

      /* obstacle motion */
      const o = obstacle.current;
      if (o.active) {
        o.x -= o.speedX;
        if (o.lane === "top" && o.y < STOP_Y) {
          o.y += o.speedY;
          if (o.y > STOP_Y) o.y = STOP_Y;
        }
        if (o.x + o.w < 0) {
          o.active = false;
          setScore((s) => s + 1);
        }
      } else {
        spawnObstacle();
      }

      /* collision */
      const hit =
        p.x < o.x + o.w &&
        p.x + p.w > o.x &&
        p.y < o.y + o.h &&
        p.y + p.h > o.y;

      if (hit) {
        cancelAnimationFrame(req);
        onGameOver(score);
        return;
      }

      /* draw */
      // ground line
      ctx.fillStyle = "#2d3748";
      ctx.fillRect(0, GROUND_LINE, 400, 5);

      // obstacle sprite
      ctx.drawImage(o.lane === "bottom" ? botImg : topImg, o.x, o.y, o.w, o.h);

      // player sprite
      ctx.drawImage(playerImg, p.x, p.y, p.w, p.h);

      req = requestAnimationFrame(loop);
    };

    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [score, playerImg, botImg, topImg, onGameOver]);

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-xl font-semibold">Score {score}</h2>
      <canvas
        ref={canvasRef}
        width={400}
        height={250}
        className="game-canvas bg-gray-900/70 rounded-lg shadow-xl"
      />
      <p className="text-sm opacity-70">Jump: Space / ↑ • Duck: ↓</p>
    </div>
  );
}
