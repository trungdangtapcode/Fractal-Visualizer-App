# Classical Interactive Fractals

## 1. Newly Implemented Geometries
Beyond the baseline WebGL Mandelbrot/Julia sets, the system now supports recursive 2D continuous line geometries drawn natively via the HTML5 Canvas API.

### The L-Systems (Line replacements)
*   **Koch Snowflake:** A curve formed by recursively altering line segments by replacing the middle third of a line with two sides of an equilateral triangle.
*   **Minkowski Island:** Similar to the Koch curve, but replaces a straight line with a complex 8-segment square-wave-like structure. 

### The Area Methods
*   **Sierpinski Triangle:** An equilateral triangle partitioned recursively into 3 smaller triangles.
*   **Sierpinski Carpet:** A square subdivided into 9 smaller squares, removing the central square recursively.

## 2. Canvas Rendering Insights & Bug Fixes
A significant challenge when rendering closed-loop recursive polygons on HTML `CanvasRenderingContext2D` was shape coloring.
Initially, individual lines within deep recursive levels were drawn starting with a fresh `ctx.moveTo()`. This fragmented the polygon path, causing `ctx.fill()` algorithms to bleed a transparent glitch (like thin, faded orange stripes bounding the screen) because the API couldn't determine enclosed geometric paths accurately.

**Resolution:** The logic was modified to initiate a single `ctx.beginPath()` and `ctx.moveTo(startX, startY)` at depth 0, relying entirely on chains of `ctx.lineTo()` throughout deeper branches. This allowed a perfectly solid `ctx.fill()` with zero visual tearing.
