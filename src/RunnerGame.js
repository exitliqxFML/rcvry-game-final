import React, { useRef, useEffect, useState } from "react";

import playerPng       from "./assets/player.png";
import obstaclePng     from "./assets/obstacle.png";
import obstacleTopPng  from "./assets/obstacleTop.png";

const CANVAS_W = 800;
const CANVAS_H = 300;
const GROUND_Y  = 240;

const PLAYER_W  = 48;
const PLAYER_H  = 48;
const DUCK_H    = 32;

const GRAVITY   = 0.55;
const JUMP_VEL  = -11;

export default function RunnerGame() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  // one Image() object per sprite
  const images = useRef({
    player      : new Image(),
    obstacle    : new Image(),
    obstacleTop : new Image(),
  });

  /* ---------- preload PNGs ---------- */
  useEffect(() => {
    images.current.player.src      = playerPng;
    images.current.obstacle.src    = obstaclePng;
    images.current.obstacleTop.src = obstacleTopPng;

    Promise.all(
      Object.values(images.current).map(
        img => new Promise(res => (img.complete ? res() : (img.onload = res)))
      )
    ).then(() => setReady(true));
  }, []);

  /* ---------- game loop ---------- */
  useEffect(() => {
    if (!ready) return;

    const ctx = canvasRef.current.getContext("2d");

    let frame = 0;
    let playerY = GROUND_Y - PLAYER_H;
    let velY    = 0;
    let ducking = false;

    const obstacles = [];

    /** spawn a top or bottom obstacle */
    function spawn() {
      const top = Math.random() < 0.4;
      obstacles.push({
        x   : CANVAS_W,
        y   : top ? 40 : GROUND_Y - images.current.obstacle.height,
        w   : images.current.obstacle.width,
        h   : images.current.obstacle.height,
        top,
      });
    }

    /* ------- input handlers ------- */
    function keyDown(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (playerY >= GROUND_Y - PLAYER_H && !ducking) velY = JUMP_VEL;
      } else if (e.code === "ArrowDown") {
        ducking = true;
      }
    }
    function keyUp(e) {
      if (e.code === "ArrowDown") ducking = false;
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup",   keyUp);

    /* ------- main loop ------- */
    let rafId;
    function loop() {
      /* physics */
      velY += GRAVITY;
      playerY += velY;
      if (playerY > GROUND_Y - PLAYER_H) {
        playerY = GROUND_Y - PLAYER_H;
        velY = 0;
      }

      /* spawn every 90 frames */
      if (frame % 90 === 0) spawn();

      /* move obstacles */
      obstacles.forEach(o => (o.x -= 6));
      if (obstacles.length && obstacles[0].x + obstacles[0].w < 0) obstacles.shift();

      /* draw */
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // ground
      ctx.fillStyle = "#5ec5c4";
      ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);

      // player
      const pImg = images.current.player;
      const pH   = ducking ? DUCK_H : PLAYER_H;
      ctx.drawImage(pImg, 0, 0, pImg.width, pImg.height, 80, playerY + (PLAYER_H - pH), PLAYER_W, pH);

      // obstacles & collision
      obstacles.forEach(o => {
        const img = o.top ? images.current.obstacleTop : images.current.obstacle;
        ctx.drawImage(img, o.x, o.y);

        const hit =
          80 + PLAYER_W > o.x &&
          80 < o.x + o.w &&
          playerY + pH > o.y &&
          playerY < o.y + o.h;

        if (hit) {
          cancelAnimationFrame(rafId);
          alert("Game over 😬");
        }
      });

      frame++;
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup",   keyUp);
    };
  }, [ready]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="border mx-auto block"
    />
  );
}
