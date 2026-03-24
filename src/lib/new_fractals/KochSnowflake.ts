import { IFractalStrategy, FractalState, Point } from './IFractal';

export class KochSnowflake implements IFractalStrategy {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = state.color || '#00e5ff';
        ctx.lineWidth = 1.0;

        const size = Math.min(width, height) * 0.7 * state.zoom;
        const cx = width / 2 + state.offsetX;
        const cy = height / 2 + size / 3 + state.offsetY; 
        
        const p1: Point = { x: cx, y: cy - size * Math.sqrt(3) / 2 };
        const p2: Point = { x: cx - size / 2, y: cy };
        const p3: Point = { x: cx + size / 2, y: cy };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        this.renderKochLine(ctx, p1, p3, state.iterations, width, height);
        this.renderKochLine(ctx, p3, p2, state.iterations, width, height);
        this.renderKochLine(ctx, p2, p1, state.iterations, width, height);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
        ctx.fill();
        ctx.stroke();
    }

    private renderKochLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, depth: number, w: number, h: number) {
        // Frustum Viewport Culling & Simplification Optimization
        const lenSq = (p2.x - p1.x)**2 + (p2.y - p1.y)**2;
        if (lenSq < 0.25 || depth === 0) { // If branch < 0.5px, treat as straight line cap
            ctx.lineTo(p2.x, p2.y);
            return;
        }

        const len = Math.sqrt(lenSq);
        const pad = len * 0.3; // Max outward Koch bulge bounding
        const minX = Math.min(p1.x, p2.x) - pad;
        const maxX = Math.max(p1.x, p2.x) + pad;
        const minY = Math.min(p1.y, p2.y) - pad;
        const maxY = Math.max(p1.y, p2.y) + pad;
        
        // Exclude if bounding box is entirely completely outside canvas
        if (maxX < 0 || minX > w || maxY < 0 || minY > h) {
            ctx.lineTo(p2.x, p2.y);
            return;
        }

        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;

        const a: Point = { x: p1.x + deltaX / 3, y: p1.y + deltaY / 3 };
        const b: Point = { x: p1.x + deltaX * 2 / 3, y: p1.y + deltaY * 2 / 3 };

        const angle = Math.atan2(deltaY, deltaX) - Math.PI / 3;
        const peak: Point = { 
            x: a.x + Math.cos(angle) * (len / 3), 
            y: a.y + Math.sin(angle) * (len / 3) 
        };

        this.renderKochLine(ctx, p1, a, depth - 1, w, h);
        this.renderKochLine(ctx, a, peak, depth - 1, w, h);
        this.renderKochLine(ctx, peak, b, depth - 1, w, h);
        this.renderKochLine(ctx, b, p2, depth - 1, w, h);
    }
}
