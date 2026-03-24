import { IFractalStrategy, FractalState, Point } from './IFractal';

export class SierpinskiTriangle implements IFractalStrategy {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = state.color || '#00e5ff';
        
        const size = Math.min(width, height) * 0.8 * state.zoom;
        const cx = width / 2 + state.offsetX;
        const cy = height / 2 + size / 3 + state.offsetY; 
        
        const p1: Point = { x: cx, y: cy - size * Math.sqrt(3) / 2 };
        const p2: Point = { x: cx - size / 2, y: cy };
        const p3: Point = { x: cx + size / 2, y: cy };

        ctx.beginPath();
        this.renderTriangle(ctx, p1, p2, p3, state.iterations, width, height);
        ctx.fill();
    }

    private renderTriangle(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point, depth: number, w: number, h: number) {
        const minX = Math.min(p1.x, p2.x, p3.x);
        const maxX = Math.max(p1.x, p2.x, p3.x);
        const minY = Math.min(p1.y, p2.y, p3.y);
        const maxY = Math.max(p1.y, p2.y, p3.y);

        // Cull out of bounds
        if (maxX < 0 || minX > w || maxY < 0 || minY > h) return;
        
        // Pixel culled
        if (depth === 0 || (maxX - minX < 0.5 && maxY - minY < 0.5)) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p1.x, p1.y);
            return;
        }

        const mid12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const mid23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
        const mid31 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 };

        this.renderTriangle(ctx, p1, mid12, mid31, depth - 1, w, h);
        this.renderTriangle(ctx, mid12, p2, mid23, depth - 1, w, h);
        this.renderTriangle(ctx, mid31, mid23, p3, depth - 1, w, h);
    }
}

export class SierpinskiCarpet implements IFractalStrategy {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = state.color || '#ff0055';
        
        const size = Math.min(width, height) * 0.8 * state.zoom;
        const x = (width - size) / 2 + state.offsetX;
        const y = (height - size) / 2 + state.offsetY;

        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#000000'; // Cutout color (or background)
        
        this.renderCarpet(ctx, x, y, size, state.iterations, width, height); 
    }

    private renderCarpet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, depth: number, w: number, h: number) {
        if (x > w || x + size < 0 || y > h || y + size < 0) return;
        if (depth === 0 || size < 0.5) return;

        const subSize = size / 3;
        
        // Punch center hole
        ctx.fillRect(x + subSize, y + subSize, subSize, subSize);

        // Sub squares 
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (row === 1 && col === 1) continue; // Skip center hole
                this.renderCarpet(ctx, x + col * subSize, y + row * subSize, subSize, depth - 1, w, h);
            }
        }
    }
}
