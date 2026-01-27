"use client";

/**
 * Floating Nodes Background
 *
 * Animated network visualization with floating nodes and connections.
 * Used as ambient background on search/list pages.
 */

import { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface FloatingNodesProps {
  /** Number of nodes */
  nodeCount?: number;
  /** Connection distance threshold */
  connectionDistance?: number;
  className?: string;
}

export function FloatingNodes({
  nodeCount = 50,
  connectionDistance = 150,
  className = "",
}: FloatingNodesProps) {
  const { currentPalette } = useTheme();
  const nodeColor = currentPalette["--color-primary"] || "#8b5cf6";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize nodes
  const initNodes = useCallback(
    (width: number, height: number) => {
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 2 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.3,
        });
      }
      nodesRef.current = nodes;
    },
    [nodeCount],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { width: rect.width, height: rect.height };
      initNodes(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Parse color
    const r = parseInt(nodeColor.slice(1, 3), 16);
    const g = parseInt(nodeColor.slice(3, 5), 16);
    const b = parseInt(nodeColor.slice(5, 7), 16);

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const nodes = nodesRef.current;

      // Update node positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      });

      // Draw connections
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 3,
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core node
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodeColor, connectionDistance, initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
