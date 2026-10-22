import gifencPkg from 'gifenc';
import type { AttackScenario, Player, PlayerMovement } from '../types/volleyball';

// Support both ESM and CJS bundling of gifenc
const { GIFEncoder, quantize, applyPalette } = (gifencPkg as any).default || gifencPkg;

export interface GifExportOptions {
  scenario: AttackScenario;
  movements: PlayerMovement[];
  roster: Player[];
  rotation: number;
  showBlockShadow?: boolean;
  width?: number;
  height?: number;
  onProgress?: (progressPct: number, currentFrame: number, totalFrames: number) => void;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export async function exportCourtAnimationGif(options: GifExportOptions): Promise<{
  blob: Blob;
  url: string;
  fileSize: number;
}> {
  const {
    scenario,
    movements,
    roster,
    rotation,
    showBlockShadow = true,
    width = 520,
    height = 680,
    onProgress
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const gif = GIFEncoder();

  // Court geometry inside canvas
  const paddingX = 30;
  const paddingTop = 70;
  const courtW = width - (paddingX * 2);
  const courtH = height - paddingTop - 40;
  const courtLeft = paddingX;
  const courtTop = paddingTop;
  const netY = courtTop + (courtH * 0.5);

  const getPlayer = (id: string) => roster.find(p => p.id === id);

  // Full-court coordinates calculation (matching Court.svelte logic)
  const attackerX = (scenario.attackerX ?? 82);
  const attackerY = (scenario.attackerY ?? 86) * 0.5; // Opponent half (0 to 50%)
  const targetX = (scenario.targetX ?? 50);
  const targetY = 50 + ((scenario.targetY ?? 70) * 0.5); // Defending half (50 to 100%)

  const toCanvasX = (pct: number) => courtLeft + (pct / 100) * courtW;
  const toCanvasY = (pct: number) => courtTop + (pct / 100) * courtH;

  const attackerCanvas = { x: toCanvasX(attackerX), y: toCanvasY(attackerY) };
  const targetCanvas = { x: toCanvasX(targetX), y: toCanvasY(targetY) };

  // Generate frame sequence:
  // 1. Hold Base (progress 0) for 6 frames (approx 360ms)
  // 2. Animate Base -> Spike for 16 frames (approx 960ms)
  // 3. Hold Spike (progress 1) for 7 frames (approx 420ms)
  // 4. Animate Spike -> Base for 13 frames (approx 780ms)
  const progressFrames: number[] = [];
  const holdBaseCount = 5;
  const transitionForwardCount = 14;
  const holdSpikeCount = 6;
  const transitionBackCount = 12;

  for (let i = 0; i < holdBaseCount; i++) progressFrames.push(0);
  for (let i = 1; i <= transitionForwardCount; i++) {
    progressFrames.push(easeInOutCubic(i / transitionForwardCount));
  }
  for (let i = 0; i < holdSpikeCount; i++) progressFrames.push(1);
  for (let i = 1; i <= transitionBackCount; i++) {
    progressFrames.push(easeInOutCubic(1 - (i / transitionBackCount)));
  }

  const totalFrames = progressFrames.length;
  const frameDelay = 65; // ms per frame (~15.4 fps)

  for (let f = 0; f < totalFrames; f++) {
    const t = progressFrames[f];

    // Clear background
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, width, height);

    // Header banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('VolleyDefense Tactics', paddingX, 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${scenario.name} • Rotation R${rotation}`, paddingX, 52);

    // Stage indicator pill
    const stageText = t < 0.15 ? 'Base Position' : (t > 0.85 ? 'Set / Spike Position' : 'Transitioning...');
    const stageColor = t < 0.15 ? '#2563eb' : (t > 0.85 ? '#e11d48' : '#d97706');
    ctx.fillStyle = stageColor;
    ctx.beginPath();
    ctx.roundRect(width - paddingX - 120, 22, 120, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stageText, width - paddingX - 60, 38);
    ctx.textAlign = 'start';

    // Court floor background
    // Opponent half (top)
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(courtLeft, courtTop, courtW, courtH * 0.5);
    // Defending half (bottom)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(courtLeft, netY, courtW, courtH * 0.5);

    // Court border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(courtLeft, courtTop, courtW, courtH);

    // Attack 3m lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    // Opponent 3m line (1/3 of opponent half from net)
    const opp3mY = netY - (courtH * 0.5) * (3 / 9);
    ctx.beginPath();
    ctx.moveTo(courtLeft, opp3mY);
    ctx.lineTo(courtLeft + courtW, opp3mY);
    ctx.stroke();

    // Defending 3m line (1/3 of defending half from net)
    const def3mY = netY + (courtH * 0.5) * (3 / 9);
    ctx.beginPath();
    ctx.moveTo(courtLeft, def3mY);
    ctx.lineTo(courtLeft + courtW, def3mY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Center Net Line
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(courtLeft - 8, netY);
    ctx.lineTo(courtLeft + courtW + 8, netY);
    ctx.stroke();

    // Net Antenna markers (red/white)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(courtLeft - 4, netY - 14, 4, 28);
    ctx.fillRect(courtLeft + courtW, netY - 14, 4, 28);

    // Net label watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('NET (18m x 9m)', courtLeft + 6, netY - 5);

    // Zone floor numbers watermark (defending court)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zone 4', toCanvasX(20), toCanvasY(62));
    ctx.fillText('Zone 3', toCanvasX(50), toCanvasY(62));
    ctx.fillText('Zone 2', toCanvasX(80), toCanvasY(62));
    ctx.fillText('Zone 5', toCanvasX(20), toCanvasY(85));
    ctx.fillText('Zone 6', toCanvasX(50), toCanvasY(85));
    ctx.fillText('Zone 1', toCanvasX(80), toCanvasY(85));
    ctx.textAlign = 'start';

    // Calculate interpolated players positions for this frame
    const currentPlayers = movements.map(m => {
      const p = getPlayer(m.playerId);
      const isMale = p ? p.gender === 'M' : true;
      const curX = m.basePosition.x + (m.defensePosition.x - m.basePosition.x) * t;
      const curY = m.basePosition.y + (m.defensePosition.y - m.basePosition.y) * t;
      const fullY = 50 + (curY * 0.5);

      return {
        ...m,
        player: p,
        isMale,
        curX,
        curY,
        canvasX: toCanvasX(curX),
        canvasY: toCanvasY(fullY)
      };
    });

    // Block shadow calculation (matching Court.svelte logic)
    if (showBlockShadow) {
      const blockers = currentPlayers.filter(p => {
        const isTouchingNet = p.curY <= 10;
        const isNextToAttacker = Math.abs(p.curX - attackerX) <= 22;
        const isBlockerRole = (p.player?.role ? p.player.role.toLowerCase().includes('block') : false) ||
          p.actionTitle.toLowerCase().includes('block') ||
          p.instructions.toLowerCase().includes('block');
        return isTouchingNet && isNextToAttacker && isBlockerRole;
      });

      if (blockers.length > 0) {
        const minBlockerX = Math.min(...blockers.map(b => b.curX));
        const maxBlockerX = Math.max(...blockers.map(b => b.curX));
        const leftNetPct = Math.max(3, minBlockerX - 4);
        const rightNetPct = Math.min(97, maxBlockerX + 4);

        const dyNet = Math.max(4, 50 - attackerY);
        const dyBase = 98 - attackerY;
        const projLeftPct = Math.max(2, Math.min(98, attackerX + ((leftNetPct - attackerX) / dyNet) * dyBase));
        const projRightPct = Math.max(2, Math.min(98, attackerX + ((rightNetPct - attackerX) / dyNet) * dyBase));

        ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(leftNetPct), toCanvasY(50));
        ctx.lineTo(toCanvasX(rightNetPct), toCanvasY(50));
        ctx.lineTo(toCanvasX(projRightPct), toCanvasY(98));
        ctx.lineTo(toCanvasX(projLeftPct), toCanvasY(98));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Red attack spike vector line
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(attackerCanvas.x, attackerCanvas.y);
    ctx.lineTo(targetCanvas.x, targetCanvas.y);
    ctx.stroke();

    // Target Landing Circle
    ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(targetCanvas.x, targetCanvas.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner target dot
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(targetCanvas.x, targetCanvas.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Attacker: Realistic Volleyball Ball
    const ballR = 14;
    ctx.save();
    ctx.translate(attackerCanvas.x, attackerCanvas.y);
    // Outer drop shadow
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 8;
    // Base ball
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, ballR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow
    // Blue panels
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(0, 0, ballR, -Math.PI / 2, 0);
    ctx.quadraticCurveTo(ballR * 0.4, ballR * 0.4, 0, -ballR);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, ballR, Math.PI / 2, Math.PI);
    ctx.quadraticCurveTo(-ballR * 0.4, -ballR * 0.4, 0, ballR);
    ctx.fill();
    // Ball border & seam
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, ballR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw Defending Players
    for (const playerItem of currentPlayers) {
      const px = playerItem.canvasX;
      const py = playerItem.canvasY;
      const isMale = playerItem.isMale;
      const tokenR = 15;

      // Token background circle
      ctx.fillStyle = isMale ? '#2563eb' : '#facc15';
      ctx.strokeStyle = isMale ? '#bfdbfe' : '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, tokenR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Player ID label (P1..P6)
      ctx.fillStyle = isMale ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(playerItem.playerId.toUpperCase(), px, py);

      // Role pill beneath token
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 0.8;
      const roleText = playerItem.player?.role ? playerItem.player.role.toUpperCase() : 'DEF';
      ctx.font = 'bold 8px sans-serif';
      const roleWidth = ctx.measureText(roleText).width + 8;
      ctx.beginPath();
      ctx.roundRect(px - roleWidth / 2, py + tokenR + 2, roleWidth, 14, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isMale ? '#93c5fd' : '#fef08a';
      ctx.fillText(roleText, px, py + tokenR + 9);
    }

    // Watermark footer
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Generated by VolleyDefense Tactics', width / 2, height - 12);
    ctx.textAlign = 'start';

    // Quantize and write frame to GIFEncoder
    const imgData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imgData.data, 256);
    const index = applyPalette(imgData.data, palette);
    gif.writeFrame(index, width, height, { palette, delay: frameDelay });

    if (onProgress) {
      onProgress(Math.round(((f + 1) / totalFrames) * 100), f + 1, totalFrames);
    }

    // Small yield so browser UI remains responsive during rendering
    if (f % 5 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([bytes], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    fileSize: blob.size
  };
}
