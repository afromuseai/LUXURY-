import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  pulsePhase: number;
  layer: number;
}

export function NeuralNetwork({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const W = svg.clientWidth || 400;
    const H = svg.clientHeight || 300;

    // Define a grid of nodes in layers
    const layers = [3, 5, 5, 3];
    const layerXPositions = [0.15, 0.38, 0.62, 0.85];
    const nodes: Node[] = [];

    layers.forEach((count, layerIdx) => {
      const x = W * layerXPositions[layerIdx];
      for (let i = 0; i < count; i++) {
        const spacing = H / (count + 1);
        nodes.push({
          x,
          y: spacing * (i + 1),
          pulsePhase: Math.random() * Math.PI * 2,
          layer: layerIdx,
        });
      }
    });

    // Build connections (each node connects to all nodes in next layer)
    const connections: Array<{ from: Node; to: Node; speed: number; offset: number }> = [];
    let ni = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const fromCount = layers[l];
      const toStart = layers.slice(0, l + 1).reduce((a, b) => a + b, 0);
      const toCount = layers[l + 1];
      for (let fi = ni; fi < ni + fromCount; fi++) {
        for (let ti = toStart; ti < toStart + toCount; ti++) {
          connections.push({
            from: nodes[fi],
            to: nodes[ti],
            speed: 0.4 + Math.random() * 0.6,
            offset: Math.random(),
          });
        }
      }
      ni += fromCount;
    }

    // Clear SVG
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const NS = "http://www.w3.org/2000/svg";

    // Add defs for glow filter
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `
      <filter id="nn-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="nn-glow-gold" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    // Draw static connection lines
    const connGroup = document.createElementNS(NS, "g");
    const connLines = connections.map((_conn) => {
      const line = document.createElementNS(NS, "line");
      line.setAttribute("stroke", "rgba(255,255,255,0.04)");
      line.setAttribute("stroke-width", "0.5");
      connGroup.appendChild(line);
      return line;
    });
    connections.forEach((conn, i) => {
      connLines[i].setAttribute("x1", String(conn.from.x));
      connLines[i].setAttribute("y1", String(conn.from.y));
      connLines[i].setAttribute("x2", String(conn.to.x));
      connLines[i].setAttribute("y2", String(conn.to.y));
    });
    svg.appendChild(connGroup);

    // Draw traveling dots on connections
    const dotGroup = document.createElementNS(NS, "g");
    const dots = connections.map((conn) => {
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("r", "1.5");
      circle.setAttribute("fill", conn.from.layer === 1 ? "rgba(201,168,76,0.8)" : "rgba(255,255,255,0.5)");
      if (conn.from.layer === 1) {
        circle.setAttribute("filter", "url(#nn-glow-gold)");
      }
      dotGroup.appendChild(circle);
      return circle;
    });
    svg.appendChild(dotGroup);

    // Draw node circles
    const nodeGroup = document.createElementNS(NS, "g");
    const nodeCircles = nodes.map((node) => {
      const g = document.createElementNS(NS, "g");
      const outer = document.createElementNS(NS, "circle");
      outer.setAttribute("cx", String(node.x));
      outer.setAttribute("cy", String(node.y));
      outer.setAttribute("r", "6");
      outer.setAttribute("fill", node.layer === 0 || node.layer === 3 ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)");
      outer.setAttribute("stroke", node.layer === 0 || node.layer === 3 ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.15)");
      outer.setAttribute("stroke-width", "0.5");
      const inner = document.createElementNS(NS, "circle");
      inner.setAttribute("cx", String(node.x));
      inner.setAttribute("cy", String(node.y));
      inner.setAttribute("r", "2");
      inner.setAttribute("fill", node.layer === 0 || node.layer === 3 ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.5)");
      inner.setAttribute("filter", "url(#nn-glow)");
      g.appendChild(outer);
      g.appendChild(inner);
      nodeGroup.appendChild(g);
      return { outer, inner };
    });
    svg.appendChild(nodeGroup);

    let t = 0;
    const animate = () => {
      t += 0.016;

      // Animate nodes pulsing
      nodes.forEach((node, i) => {
        const pulse = Math.sin(t * 1.5 + node.pulsePhase) * 0.5 + 0.5;
        nodeCircles[i].outer.setAttribute("r", String(5 + pulse * 2));
        nodeCircles[i].outer.setAttribute(
          "opacity",
          String(0.4 + pulse * 0.6)
        );
      });

      // Animate traveling dots
      connections.forEach((conn, i) => {
        const progress = ((t * conn.speed + conn.offset) % 1);
        const x = conn.from.x + (conn.to.x - conn.from.x) * progress;
        const y = conn.from.y + (conn.to.y - conn.from.y) * progress;
        dots[i].setAttribute("cx", String(x));
        dots[i].setAttribute("cy", String(y));
        const alpha = Math.sin(progress * Math.PI);
        dots[i].setAttribute("opacity", String(alpha * 0.8));
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full ${className}`}
      style={{ overflow: "visible" }}
    />
  );
}
