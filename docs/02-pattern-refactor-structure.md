# Architecture & Pattern Refactoring

## 1. Overview
The project initially started with a monolithic `App.tsx` handling complex WebGL shader initializations alongside generic UI state. As the project scaled to include multiple types of 2D canvas geometrical fractals, it became necessary to apply **Clean Architecture** and design patterns to ensure maintainability and scalability.

## 2. Structural Separation
The application is now divided into distinct layers:
*   **UI Components:** (`src/components/`) Contains React views like the `Sidebar` for navigation and `FractalView` for handling the Canvas API mounting, freeing `App.tsx` to act purely as an entry-point router mapping the workspace layout.
*   **Mathematical Engine:** (`src/lib/new_fractals/`) Contains pure TypeScript classes dedicated strictly to mathematical logic.

## 3. The Strategy Pattern
To accommodate multiple fractal algorithms seamlessly, we implemented the **Strategy Pattern**. 
An interface `IFractalStrategy` is defined:
```typescript
export interface FractalState {
  iterations: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  color: string;
}

export interface IFractalStrategy {
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, state: FractalState): void;
}
```
Each unique fractal (e.g., `KochSnowflake`, `MinkowskiIsland`) implements this interface. The `FractalView` simply receives a `type` string from the user's `Sidebar` selection, instantiates the correct strategy class, and invokes `.draw()`. This eliminates huge switch-case drawing methods and strictly adheres to the Open-Closed Principle (OCP).
