import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { noise } from './motion';

/**
 * An n8n workflow, drawn from its own exported JSON and animated.
 *
 * The point of this over a hand-drawn diagram: n8n stores the canvas position
 * of every node, so what appears on screen is the real graph in its real
 * layout, at the real node count. Redrawing it "to look like n8n" would be a
 * mock-up of the thing rather than the thing itself.
 *
 * Everything is laid out in n8n's own coordinate space and moved as one group
 * by the camera, so node positions never need converting.
 */

export type Graph = {
  name: string;
  nodes: { id: string; type: string; x: number; y: number; disabled?: boolean }[];
  edges: { from: string; to: string }[];
};

const NODE = 96; // n8n draws a standard node at about 100 square
const ORANGE = '#ff7043';
const CYAN = '#4fd6e0';
const DIM = 'rgba(240,233,220,0.34)';

/**
 * One glyph per node type. Drawn rather than imported: n8n's icon set is not
 * redistributable, and a viewer reads the shape (a clock, a globe, braces) far
 * faster than they read the label underneath it anyway.
 */
const ICONS: Record<string, React.ReactNode> = {
  manualTrigger: <path d="M8 5l14 9-14 9z" />,
  scheduleTrigger: (
    <>
      <circle cx="15" cy="15" r="11" fill="none" strokeWidth="2.6" stroke="currentColor" />
      <path d="M15 8v7.5l5 3" fill="none" strokeWidth="2.6" stroke="currentColor" strokeLinecap="round" />
    </>
  ),
  set: (
    <path
      d="M20.5 4.5l5 5L11 24H6v-5zM18 7l5 5"
      fill="none"
      strokeWidth="2.6"
      stroke="currentColor"
      strokeLinejoin="round"
    />
  ),
  httpRequest: (
    <>
      <circle cx="15" cy="15" r="11" fill="none" strokeWidth="2.4" stroke="currentColor" />
      <path
        d="M4 15h22M15 4c4 4 4 18 0 22M15 4c-4 4-4 18 0 22"
        fill="none"
        strokeWidth="2.2"
        stroke="currentColor"
      />
    </>
  ),
  code: (
    <path
      d="M11 8L4 15l7 7M19 8l7 7-7 7"
      fill="none"
      strokeWidth="2.8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  splitInBatches: (
    <path
      d="M7 12a8 8 0 1 1 0 6M7 12l-3-3M7 12l4-2"
      fill="none"
      strokeWidth="2.6"
      stroke="currentColor"
      strokeLinecap="round"
    />
  ),
  if: (
    <path
      d="M5 15h7l6-8h7M12 15l6 8h7M22 4l5 3-5 3M22 20l5 3-5 3"
      fill="none"
      strokeWidth="2.4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  merge: (
    <path
      d="M3 7h7l6 8h11M3 23h7l6-8M22 11l5 4-5 4"
      fill="none"
      strokeWidth="2.4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  readWriteFile: (
    <path d="M8 3h9l6 6v18H8zM17 3v6h6" fill="none" strokeWidth="2.4" stroke="currentColor" strokeLinejoin="round" />
  ),
  convertToFile: (
    <path
      d="M8 3h9l6 6v18H8zM17 3v6h6M12 18h8M16 14v8"
      fill="none"
      strokeWidth="2.4"
      stroke="currentColor"
      strokeLinejoin="round"
    />
  ),
  extractFromFile: (
    <path
      d="M8 3h9l6 6v18H8zM17 3v6h6M12 19h8M16 15l4 4-4 4"
      fill="none"
      strokeWidth="2.4"
      stroke="currentColor"
      strokeLinejoin="round"
    />
  ),
  sort: <path d="M6 8h18M6 15h12M6 22h6" fill="none" strokeWidth="2.8" stroke="currentColor" strokeLinecap="round" />,
  googleSheets: (
    <>
      <rect x="5" y="4" width="20" height="22" rx="2" fill="none" strokeWidth="2.4" stroke="currentColor" />
      <path d="M5 12h20M5 19h20M15 4v22" fill="none" strokeWidth="2.2" stroke="currentColor" />
    </>
  ),
};

const FALLBACK = <circle cx="15" cy="15" r="9" fill="none" strokeWidth="2.6" stroke="currentColor" />;

/** Cubic bezier between two node ports, in n8n's own coordinate space. */
function edgePath(ax: number, ay: number, bx: number, by: number) {
  const dx = Math.max(60, Math.abs(bx - ax) * 0.5);
  return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
}

/**
 * The whole canvas.
 *
 * `wave` is a position in n8n x-space: edges behind it have already fired, the
 * one it is passing lights up. Driving everything off a single moving x rather
 * than per-edge timers is what keeps the pulses and the camera in step - both
 * read the same number, so they cannot drift apart.
 */
export const WorkflowCanvas: React.FC<{
  graph: Graph;
  wave: number;
  camX: number;
  camY: number;
  scale: number;
}> = ({ graph, wave, camX, camY, scale }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  return (
    <AbsoluteFill style={{ backgroundColor: '#0d0d0f', overflow: 'hidden' }}>
      {/* n8n's dotted canvas, moving with the camera. A plain black field gives
          the eye nothing to measure the motion against, and the pan stops
          reading as a pan at all. */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(240,233,220,0.11) 1.4px, transparent 1.4px)',
          backgroundSize: `${22 * scale}px ${22 * scale}px`,
          backgroundPosition: `${-camX * scale}px ${-camY * scale}px`,
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${width / 2}px, ${height / 2}px) scale(${scale}) translate(${-camX}px, ${-camY}px)`,
          transformOrigin: '0 0',
        }}
      >
        <svg
          width={8000}
          height={3000}
          viewBox="-1200 -1200 8000 3000"
          style={{ position: 'absolute', left: -1200, top: -1200, overflow: 'visible' }}
        >
          {graph.edges.map((e, i) => {
            const a = pos[e.from];
            const b = pos[e.to];
            if (!a || !b) return null;

            const ax = a.x + NODE;
            const ay = a.y + NODE / 2;
            const bx = b.x;
            const by = b.y + NODE / 2;
            const d = edgePath(ax, ay, bx, by);

            // Timed off the SOURCE node plus a fixed span, not off the gap
            // between source and target. A loop-back edge (Parse Page Results
            // returns to Loop Pages, 660px to its left) would otherwise give
            // interpolate a decreasing input range, which it rejects outright.
            const start = a.x + NODE;
            const t = interpolate(wave, [start, start + 300], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const live = t > 0 && t < 1;
            const LEN = 1400;

            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(240,233,220,0.22)" strokeWidth={2.4} />
                {t > 0 ? (
                  <path
                    d={d}
                    fill="none"
                    stroke={CYAN}
                    strokeWidth={live ? 4.2 : 2.6}
                    strokeLinecap="round"
                    strokeDasharray={live ? `90 ${LEN}` : `${LEN} ${LEN}`}
                    strokeDashoffset={live ? LEN * 0.5 - t * LEN * 0.5 - 40 : 0}
                    opacity={live ? 1 : 0.5}
                    style={{ filter: `drop-shadow(0 0 ${live ? 10 : 5}px ${CYAN})` }}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {graph.nodes.map((n) => {
          // A node lights as the wave passes and stays lit: the reel is showing
          // a run completing, not a cursor sweeping over static art.
          // Lights AFTER the incoming pulse lands, not as the wave passes.
          // A pulse takes 300 wave-units from its source, and standard node
          // spacing is 220, so the arrival is roughly 80-180 past the node.
          const on = interpolate(wave, [n.x + 80, n.x + 180], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const b = noise(Math.floor(frame / (fps / 10)) + n.x) - 0.5;
          const icon = ICONS[n.type] || FALLBACK;

          return (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: NODE,
                transform: `translate(${b * 0.8}px, ${b * 0.8}px)`,
              }}
            >
              <div
                style={{
                  width: NODE,
                  height: NODE,
                  borderRadius: 14,
                  background: '#1f1f24',
                  border: `1.5px solid ${on > 0.5 ? CYAN : 'rgba(240,233,220,0.16)'}`,
                  boxShadow: on > 0.5 ? `0 0 ${18 * on}px ${CYAN}66` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: n.disabled ? 0.42 : 1,
                }}
              >
                <svg width={44} height={44} viewBox="0 0 30 30" style={{ color: n.disabled ? DIM : ORANGE }}>
                  <g fill={n.disabled ? DIM : ORANGE}>{icon}</g>
                </svg>
              </div>
              <div
                style={{
                  marginTop: 10,
                  width: 190,
                  marginLeft: (NODE - 190) / 2,
                  textAlign: 'center',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.25,
                  color: n.disabled ? DIM : `rgba(240,233,220,${0.45 + on * 0.55})`,
                }}
              >
                {n.id}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
