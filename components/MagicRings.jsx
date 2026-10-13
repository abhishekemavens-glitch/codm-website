
"use client";

import { useEffect, useRef } from "react"; 

export default function MagicRings({
  className = "",
  color = "#8B5CF6",
  colorTwo = "#6366F1",
  speed = 0.65,
  followMouse = true,
  clickBurst = true,
  theme = "light",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame;
    let width = 0;
    let height = 0;
    let time = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const bursts = [];

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function handlePointerMove(event) {
      const rect = canvas.getBoundingClientRect();

      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    }

    function handlePointerLeave() {
      mouse.active = false;
    }

    function handleClick(event) {
      if (!clickBurst) return;

      const rect = canvas.getBoundingClientRect();

      bursts.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        age: 0,
      });
    }

    function drawRing(cx, cy, radius, index, phase) {
      const segments = 220;
      const points = [];

      const mouseDistance = Math.hypot(
        mouse.x - cx,
        mouse.y - cy
      );

      const mouseInfluence =
        followMouse && mouse.active
          ? Math.max(0, 1 - mouseDistance / 450)
          : 0;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;

        const wave =
          Math.sin(angle * 3 + phase) * 3 +
          Math.sin(angle * 5 - phase * 0.7) * 2 +
          Math.sin(angle * 2 + phase * 0.4) * 2;

        const mouseWave = mouseInfluence * 13;

        const r = radius + wave + mouseWave;

        points.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }

      const gradient = ctx.createLinearGradient(
        cx - radius,
        cy - radius,
        cx + radius,
        cy + radius
      );

      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, colorTwo);
      gradient.addColorStop(1, color);

      ctx.beginPath();

      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.closePath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = index % 2 === 0 ? 1.3 : 0.8;
      ctx.globalAlpha = 0.25 + (index % 4) * 0.09;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const maxRadius = Math.max(width, height) * 0.58;
      const ringCount = 30;

      if (!reducedMotion) {
        time += 0.006 * Math.max(0, speed);
      }

      for (let i = 0; i < ringCount; i++) {
        const progress = i / ringCount;

        const radius =
          15 +
          progress * maxRadius +
          Math.sin(time + i * 0.15) * 2;

        drawRing(cx, cy, radius, i, time + i * 0.08);
      }

      // Cursor glow
      if (followMouse && mouse.active) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          100
        );

        glow.addColorStop(0, `${color}20`);
        glow.addColorStop(1, `${color}00`);

        ctx.fillStyle = glow;
        ctx.fillRect(
          mouse.x - 100,
          mouse.y - 100,
          200,
          200
        );
      }

      // Click bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const burst = bursts[i];
        const radius = burst.age * 2.5;

        ctx.beginPath();
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, 1 - burst.age / 35);
        ctx.stroke();
        ctx.globalAlpha = 1;

        burst.age += 1;

        if (burst.age > 35) {
          bursts.splice(i, 1);
        }
      }

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, [color, colorTwo, speed, followMouse, clickBurst]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        opacity: theme === "light" ? 0.8 : 1,
      }}
    />
  );
}
