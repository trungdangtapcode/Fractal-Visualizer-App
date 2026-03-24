export interface Point {
    x: number;
    y: number;
}

export interface FractalState {
    iterations: number;
    zoom: number;
    offsetX: number;
    offsetY: number;
    color: string;
}

export interface IFractalStrategy {
    /**
     * Renders the fractal onto the given canvas context.
     * @param ctx Canvas 2D rendering context
     * @param width Width of the canvas
     * @param height Height of the canvas
     * @param state Current view state (zoom, pan, iterations)
     */
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void;
}
