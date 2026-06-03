"use client";
import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  // permanent slow drift — flips on wall bounce
  driftVx: number;
  driftVy: number;
  // temporary repel force — decays to zero between interactions
  repelVx: number;
  repelVy: number;
  radius: number;
  isHub: boolean;
}

const CONNECTION_DIST = 150;
const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
const REPEL_DIST = 160;
const REPEL_FORCE = 6;
const REPEL_DECAY = 0.91;

function makeNode(w: number, h: number): Node {
  const r = Math.random();
  // 1/3 large hubs (2.8–4px), 2/3 small (1–1.7px)
  const radius =
    r < 0.333
      ? 2.8 + Math.random() * 1.2
      : 1 + Math.random() * 0.7;

  const speed = 0.25 + Math.random() * 0.35;
  const angle = Math.random() * Math.PI * 2;

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    driftVx: Math.cos(angle) * speed,
    driftVy: Math.sin(angle) * speed,
    repelVx: 0,
    repelVy: 0,
    radius,
    isHub: radius > 2.7,
  };
}

export default function DotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const mouse = { x: -9999, y: -9999 };
    let rafId: number;
    let nodes: Node[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(
        260,
        Math.max(120, Math.floor((canvas.width * canvas.height) / 9000))
      );
      nodes = Array.from({ length: count }, () =>
        makeNode(canvas.width, canvas.height)
      );
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const animate = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // ── Connection lines (drawn before nodes so nodes sit on top) ──
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < CONNECTION_DIST_SQ) {
            const t = 1 - Math.sqrt(dSq) / CONNECTION_DIST;
            // quadratic falloff: bold close, fades fast at distance
            const alpha = t * t * 0.28;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
            ctx.lineWidth = nodes[i].isHub && nodes[j].isHub ? 1.2 : 0.8;
            ctx.stroke();
          }
        }
      }

      // ── Nodes ──
      for (const n of nodes) {
        // Mouse / touch repel
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < REPEL_DIST * REPEL_DIST && dSq > 0) {
          const dist = Math.sqrt(dSq);
          const force = ((REPEL_DIST - dist) / REPEL_DIST) * REPEL_FORCE;
          const angle = Math.atan2(dy, dx);
          n.repelVx -= Math.cos(angle) * force;
          n.repelVy -= Math.sin(angle) * force;
        }

        // Repel force decays back to zero frame-by-frame
        n.repelVx *= REPEL_DECAY;
        n.repelVy *= REPEL_DECAY;

        // Move: drift (permanent) + repel (temporary)
        n.x += n.driftVx + n.repelVx;
        n.y += n.driftVy + n.repelVy;

        // Wall bounce — only drift flips; repel is already decaying
        if (n.x < n.radius) {
          n.x = n.radius;
          n.driftVx = Math.abs(n.driftVx);
        } else if (n.x > w - n.radius) {
          n.x = w - n.radius;
          n.driftVx = -Math.abs(n.driftVx);
        }
        if (n.y < n.radius) {
          n.y = n.radius;
          n.driftVy = Math.abs(n.driftVy);
        } else if (n.y > h - n.radius) {
          n.y = h - n.radius;
          n.driftVy = -Math.abs(n.driftVy);
        }

        // Draw node — hubs slightly darker + larger visual weight
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.isHub ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.22)";
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
