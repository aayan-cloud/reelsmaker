import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Stage } from '../../engine/kinetic';

/**
 * Facebook Page cover, 1640x856.
 *
 * Facebook crops this differently on every surface: the sides are cut on
 * mobile, and the bottom-left is covered by the profile picture on desktop. So
 * everything that has to be readable lives in the middle ~55% and above the
 * lower third, and the outer band carries nothing but background.
 *
 * Rendered by the same engine as the reels, which is the point - the Page and
 * the videos should look like one thing.
 */
export const FbCover: React.FC = () => (
  <AbsoluteFill>
    <Stage />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: '6%' }}>
      <div style={{ textAlign: 'center', maxWidth: '74%' }}>
        <div
          style={{
            fontFamily: 'Arial Black, Arial Bold, Arial, sans-serif',
            fontWeight: 900,
            fontSize: 78,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            color: '#ffffff',
            textShadow: '0 6px 40px rgba(0,0,0,0.9)',
          }}
        >
          Free open-source tools
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: 'Arial Black, Arial Bold, Arial, sans-serif',
            fontWeight: 900,
            fontSize: 78,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            color: '#5b8cff',
            textShadow: '0 6px 40px rgba(0,0,0,0.9)',
          }}
        >
          No API keys
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: 'Consolas, Menlo, monospace',
            fontSize: 34,
            color: 'rgba(255,255,255,0.62)',
          }}
        >
          github.com/aayan-cloud
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
