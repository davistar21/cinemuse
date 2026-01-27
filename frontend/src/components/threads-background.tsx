"use client";

/**
 * Threads Background
 *
 * Animated horizontal lines that ripple near the cursor.
 * Creates an atmospheric, cinematic feel.
 */

import { useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme";

interface ThreadsProps {
  lineCount?: number;
  amplitude?: number;
  speed?: number;
  className?: string;
}

type Point = {
  x: number;
  y: number;
  baseY: number;
  vy: number;
};

export function Threads({
  lineCount = 8,
  amplitude = 20,
  speed = 2,
  className = "",
}: ThreadsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const threads = useRef<Point[][]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const { currentPalette } = useTheme();

  const primaryColor = currentPalette["--color-primary"] || "#8b5cf6";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

    const POINT_SPACING = 10;
    const ATTRACTION_RADIUS = 160;
    const ATTRACTION_STRENGTH = 0.015;
    const DAMPING = 0.88;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      createThreads();
    };

    const createThreads = () => {
      threads.current = [];
      const pointCount = Math.floor(width / POINT_SPACING);

      for (let i = 0; i < lineCount; i++) {
        const baseY = ((i + 1) / (lineCount + 1)) * height;
        const line: Point[] = [];

        for (let j = 0; j <= pointCount; j++) {
          line.push({
            x: j * POINT_SPACING,
            y: baseY,
            baseY: baseY,
            vy: 0,
          });
        }

        threads.current.push(line);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const update = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Convert hex to rgba
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;

      for (const line of threads.current) {
        for (const p of line) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ATTRACTION_RADIUS) {
            const force =
              (1 - dist / ATTRACTION_RADIUS) * Math.sin(time * 0.002 * speed);
            p.vy += -dy * force * ATTRACTION_STRENGTH;
          }

          // Return to base position
          p.vy += (p.baseY - p.y) * 0.01;

          // Subtle idle motion
          p.vy += Math.sin(p.x * 0.01 + time * 0.001) * amplitude * 0.0005;

          p.vy *= DAMPING;
          p.y += p.vy;
        }

        // Draw smooth curve
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);

        for (let i = 1; i < line.length - 1; i++) {
          const p0 = line[i];
          const p1 = line[i + 1];
          const cx = (p0.x + p1.x) / 2;
          const cy = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, cx, cy);
        }

        const last = line[line.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(update);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [primaryColor, lineCount, amplitude, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
