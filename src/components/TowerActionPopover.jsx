// Inline upgrade/sell popover rendered directly inside the gameboard SVG.
// Replaces the modal so the action stays in flow and the player can see the
// path while deciding. Two pill buttons hover next to the selected tower.

import { T, COLS, ROWS, TOWER_DEFS } from '../game/constants.js';
import { towerStats, upgradeCost, sellRefund } from '../game/world.js';

// SVG <text> doesn't render emoji reliably across systems, so we use simple
// shapes/text for icons.
function Sugar({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="6" fill="#FFD9A0" stroke="#F5B872" strokeWidth="1.5" />
      <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill="#8B5E3C">$</text>
    </g>
  );
}

export default function TowerActionPopover({ tower, world, sugar, onUpgrade, onSell }) {
  const def = TOWER_DEFS[tower.type];
  const stats = towerStats(tower, world);
  const upCost = upgradeCost(tower);
  const refund = sellRefund(tower);
  const canAfford = upCost != null && sugar >= upCost;
  const maxed = upCost == null;

  // Anchor at tower centre. Default position above; if too close to top edge,
  // flip to below. Buttons sit side-by-side.
  const cx = tower.gx * T + T / 2;
  const cy = tower.gy * T + T / 2;
  const PILL_W = 92;
  const PILL_H = 36;
  const GAP = 6;
  const groupW = maxed ? PILL_W : PILL_W * 2 + GAP;
  const placeAbove = tower.gy > 0;
  const groupY = placeAbove ? cy - T * 0.55 - PILL_H - 6 : cy + T * 0.55 + 6;
  // Clamp horizontally so pills stay on-board.
  let groupX = cx - groupW / 2;
  groupX = Math.max(8, Math.min(groupX, COLS * T - groupW - 8));

  // Mini header above the buttons: tower name + level + stats summary.
  const HDR_H = 26;
  const headerY = groupY - HDR_H - 4;
  // If header would clip off the top, push the whole popover below the tower.
  const finalAbove = placeAbove && headerY > 4;
  const finalGroupY = finalAbove ? groupY : cy + T * 0.55 + HDR_H + 10;
  const finalHeaderY = finalAbove ? headerY : finalGroupY - HDR_H - 4;

  const stars = '★'.repeat(tower.level) + '☆'.repeat(3 - tower.level);

  return (
    <g style={{ pointerEvents: 'auto' }}>
      {/* Header — name + stars + key stats */}
      <g transform={`translate(${groupX} ${finalHeaderY})`}>
        <rect width={groupW} height={HDR_H} rx="13"
              fill="white" stroke="var(--ink-faint)" strokeWidth="1.5" opacity="0.96" />
        <text x={groupW / 2} y={HDR_H / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="800"
              fill="var(--ink)" fontFamily="Fredoka, Noto Sans SC, sans-serif">
          {def.name} <tspan fill="var(--pink-deep)" fontSize="10">{stars}</tspan>
          <tspan dx="6" fill="var(--ink-soft)" fontSize="10" fontWeight="600">
            攻 {stats.dmg.toFixed(0)} · 速 {(1 / stats.cd).toFixed(1)}/s
          </tspan>
        </text>
      </g>

      {/* Upgrade button (hidden when maxed) */}
      {!maxed && (
        <g
          transform={`translate(${groupX} ${finalGroupY})`}
          style={{ cursor: canAfford ? 'pointer' : 'not-allowed' }}
          onClick={(e) => { e.stopPropagation(); if (canAfford) onUpgrade(); }}
        >
          <rect width={PILL_W} height={PILL_H} rx="18"
                fill={canAfford ? 'url(#sd-upgrade-grad)' : '#E8DDC8'}
                stroke={canAfford ? 'var(--pink-deep)' : '#C0928A'} strokeWidth="2" />
          <text x={PILL_W / 2 - 14} y={PILL_H / 2 + 5} textAnchor="middle"
                fontSize="13" fontWeight="800" fill={canAfford ? 'white' : '#8B6F5C'}
                fontFamily="Fredoka, sans-serif">
            ⬆ {tower.level + 1}★
          </text>
          <Sugar x={PILL_W - 26} y={PILL_H / 2} />
          <text x={PILL_W - 12} y={PILL_H / 2 + 4} textAnchor="middle"
                fontSize="11" fontWeight="800" fill={canAfford ? 'white' : '#8B6F5C'}
                fontFamily="Fredoka, sans-serif">
            {upCost}
          </text>
        </g>
      )}

      {/* Sell button */}
      <g
        transform={`translate(${groupX + (maxed ? 0 : PILL_W + GAP)} ${finalGroupY})`}
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onSell(); }}
      >
        <rect width={PILL_W} height={PILL_H} rx="18"
              fill="white" stroke="var(--peach-deep)" strokeWidth="2" />
        <text x={PILL_W / 2 - 16} y={PILL_H / 2 + 5} textAnchor="middle"
              fontSize="13" fontWeight="800" fill="var(--ink)"
              fontFamily="Fredoka, sans-serif">
          💰 {maxed ? '已满' : '卖'}
        </text>
        <Sugar x={PILL_W - 26} y={PILL_H / 2} />
        <text x={PILL_W - 12} y={PILL_H / 2 + 4} textAnchor="middle"
              fontSize="11" fontWeight="800" fill="var(--peach-deep)"
              fontFamily="Fredoka, sans-serif">
          +{refund}
        </text>
      </g>

      {/* Tail/arrow connecting popover to tower (visual only) */}
      <line
        x1={cx} y1={finalAbove ? finalGroupY + PILL_H + 2 : finalHeaderY - 2}
        x2={cx} y2={finalAbove ? cy - T * 0.42 : cy + T * 0.42}
        stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}
