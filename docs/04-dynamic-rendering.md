# Dynamic Rendering & Optimizations

Because drawing fractals involves exponential recursion, doing this blindly on a Canvas risks extreme browser lag or Call Stack Overflows.

## "Zoom-to-Cursor" Coordinate Math
Rather than zooming into the dead center of the screen, zooming uses the `WheelEvent` to scale exactly where the user's mouse is located. 
```javascript
// Formula: Offset_New = Mouse - Center - (Mouse - Center - Offset_Old) * (Zoom_New / Zoom_Old)
```
This requires complex dynamic manipulation of the 2D world projection (`offsetX`, `offsetY`), allowing fluid geographical panning and scaling simultaneously.

## Viewport Edge Culling
To prevent processing recursive lines that the user cannot even see natively, the algorithms calculate a Bounding Box at intermediate recursion steps.
If a branch of a fractal generates coordinates completely outside the Canvas `width` and `height`, the recursion strictly stops and returns immediately. Similarly, if the zoom distance makes a recursive segment smaller than `0.5px` relative to the screen, we skip nested iterations to conserve compute time.

## Auto-Scaling Depth Logic
To solve severe lag spikes or pixelation, the system dynamically couples the `Iterations` (Depth) to the current `Zoom` level.
Instead of a hardcoded mapping, it uses logarithmic scaling custom-tuned per mathematical shape:

*   **Line Fractals (Koch/Minkowski):** These handle detail well. A low `zoomThreshold` (e.g. 1.5x) grants an extra level of iteration, up to extremely high maximums (`Max Allowed Depth ~ 30`). 
*   **Area Fractals (Sierpinski):** These scale aggressively (increasing loops exponentially $3^N$ or $8^N$). They require strict tuning. `zoomThreshold` is high (4.0x to 5.0x zoom required for 1 extra level of depth) and maximum allowed bounds are hard-capped (`Max 10-15`) to prevent crashing the browser thread.
