import { IFractalStrategy, FractalState, Point } from './IFractal';

export class MinkowskiIsland implements IFractalStrategy {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = state.color || '#ffb300';
        ctx.lineWidth = 1;

        const size = Math.min(width, height) * 0.6 * state.zoom;
        const cx = width / 2 + state.offsetX;
        const cy = height / 2 + state.offsetY; 
        
        const p1: Point = { x: cx - size / 2, y: cy - size / 2 };
        const p2: Point = { x: cx + size / 2, y: cy - size / 2 };
        const p3: Point = { x: cx + size / 2, y: cy + size / 2 };
        const p4: Point = { x: cx - size / 2, y: cy + size / 2 };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        this.renderMinkowskiLine(ctx, p1, p2, state.iterations, width, height);
        this.renderMinkowskiLine(ctx, p2, p3, state.iterations, width, height);
        this.renderMinkowskiLine(ctx, p3, p4, state.iterations, width, height);
        this.renderMinkowskiLine(ctx, p4, p1, state.iterations, width, height);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 179, 0, 0.15)';
        ctx.fill();
        ctx.stroke();
    }

    private renderMinkowskiLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, depth: number, w: number, h: number) {
        if (depth === 0 || (Math.abs(p2.x - p1.x) < 0.5 && Math.abs(p2.y - p1.y) < 0.5)) {
            ctx.lineTo(p2.x, p2.y);
            return;
        }

        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;

        const L = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 4;
        const pad = L * 3; // Bulge
        
        const minX = Math.min(p1.x, p2.x) - pad;
        const maxX = Math.max(p1.x, p2.x) + pad;
        const minY = Math.min(p1.y, p2.y) - pad;
        const maxY = Math.max(p1.y, p2.y) + pad;

        if (maxX < 0 || minX > w || maxY < 0 || minY > h) {
            ctx.lineTo(p2.x, p2.y);
            return;
        }

        const A = Math.atan2(deltaY, deltaX);

        const t1 = { x: p1.x + Math.cos(A) * L,       y: p1.y + Math.sin(A) * L };
        const t2 = { x: t1.x + Math.cos(A - Math.PI / 2) * L, y: t1.y + Math.sin(A - Math.PI / 2) * L };
        const t3 = { x: t2.x + Math.cos(A) * L,       y: t2.y + Math.sin(A) * L };
        const t4 = { x: t3.x + Math.cos(A + Math.PI / 2) * L, y: t3.y + Math.sin(A + Math.PI / 2) * L };
        const t5 = { x: t4.x + Math.cos(A + Math.PI / 2) * L, y: t4.y + Math.sin(A + Math.PI / 2) * L };
        const t6 = { x: t5.x + Math.cos(A) * L,       y: t5.y + Math.sin(A) * L };
        const t7 = { x: t6.x + Math.cos(A - Math.PI / 2) * L, y: t6.y + Math.sin(A - Math.PI / 2) * L };

        this.renderMinkowskiLine(ctx, p1, t1, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t1, t2, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t2, t3, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t3, t4, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t4, t5, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t5, t6, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t6, t7, depth - 1, w, h);
        this.renderMinkowskiLine(ctx, t7, p2, depth - 1, w, h);
    }
}