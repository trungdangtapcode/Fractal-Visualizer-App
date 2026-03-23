# How to Run Your Tauri Hello World App

This quick guide will help you get your newly scaffolded Tauri application up and running.

## Prerequisites

1. **Node.js** (includes `npm`) - to run the frontend tooling.
2. **Rust & Cargo** - to compile the backend. 
    - Download and install from [rustup.rs](https://rustup.rs/).
3. **OS specific build tools**:
    - *Windows*: Visual Studio Build Tools with C++ Desktop Development.
    - [Tauri Prerequisites Guide](https://tauri.app/v1/guides/getting-started/prerequisites)

## Instructions

### 1. Install Dependencies
Open your terminal in this directory (`d:\lab\vscworkplace\fractal`) and install the web dependencies.

Using **npm**:
```bash
npm install
```
*(If you used `yarn` or `pnpm` instead, run `yarn install` or `pnpm install`)*

### 2. Start the Application in Development Mode
To start the app with live hot-reloading (both frontend and backend).

```bash
npm run tauri dev
```
> **First Run Note:** 
> The first time you execute this, Cargo has to download and compile the Tauri core components via Rust. This process may take a few minutes depending on your internet and CPU speed. Subsequent runs will be much faster.

### 3. Build for Production (Release)
When you're ready to create an executable (`.exe` on Windows) to share or deploy:

```bash
npm run tauri build
```
Once finished, the generated executable will typically be located inside:
`src-tauri/target/release/bundle/nsis/` or `src-tauri/target/release/bundle/msi/`

## Understanding the Structure
- `src/`: Your UI code (HTML, CSS, JavaScript/TypeScript/React/Vue).
- `src-tauri/`: Your Rust backend and `tauri.conf.json` configuration file.
