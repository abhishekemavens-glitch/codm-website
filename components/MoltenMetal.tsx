
"use client";

import { useEffect, useRef } from "react";

type MoltenMetalProps = {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  mouseInteraction?: boolean;
  opacity?: number;
  className?: string;
};

export default function MoltenMetal({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  mouseInteraction = true,
  opacity = 0.8,
  className = "",
}: MoltenMetalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    let disposed = false;

    const pointer = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!mouseInteraction) return;

      const rect = canvas.getBoundingClientRect();

      target.x = (event.clientX - rect.left) / rect.width;
      target.y = (event.clientY - rect.top) / rect.height;
    };

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        Math.max(1, radius)
      );

      gradient.addColorStop(
        0,
        `${color}${Math.round(Math.min(1, alpha) * 255)
          .toString(16)
          .padStart(2, "0")}`
      );
      gradient.addColorStop(0.35, `${color}55`);
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const render = () => {
      if (disposed) return;

      time += 0.008 * Math.max(0, speed);

      pointer.x += (target.x - pointer.x) * 0.035;
      pointer.y += (target.y - pointer.y) * 0.035;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#08080e";
      ctx.fillRect(0, 0, width, height);

      const unit = Math.max(width, height) / Math.max(1, scale);
      const count = Math.max(4, Math.min(12, Math.round(4 + detail * 2)));

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.filter = `blur(${Math.max(12, unit * 0.18)}px)`;

      for (let i = 0; i < count; i++) {
        const phase = (i / count) * Math.PI * 2;

        const x =
          width *
          (0.5 +
            0.32 * Math.sin(time + phase) +
            (pointer.x - 0.5) * (mouseInteraction ? 0.2 : 0));

        const y =
          height *
          (0.5 +
            0.32 * Math.cos(time * 0.8 + phase * 1.4) +
            (pointer.y - 0.5) * (mouseInteraction ? 0.2 : 0));

        const radius =
          unit * (0.65 + 0.3 * Math.sin(time * 1.3 + phase));

        drawGlow(
          x,
          y,
          radius * Math.max(0.2, glow),
          i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3,
          0.55
        );
      }

      ctx.restore();

      // Add bright, flowing highlights.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(2px)";

      for (let i = 0; i < 3; i++) {
        const phase = time * (0.7 + i * 0.15) + i * 2.1;
        const x = width * (0.5 + 0.3 * Math.sin(phase));
        const y = height * (0.5 + 0.3 * Math.cos(phase * 1.3));

        const gradient = ctx.createRadialGradient(
          x, y, 0, x, y, unit * 0.4
        );

        gradient.addColorStop(0, `${color3}bb`);
        gradient.addColorStop(0.15, `${color2}88`);
        gradient.addColorStop(1, `${color1}00`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);

    if (mouseInteraction) {
      canvas.addEventListener("pointermove", onPointerMove);
    }

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [
    color1,
    color2,
    color3,
    speed,
    scale,
    detail,
    glow,
    mouseInteraction,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
