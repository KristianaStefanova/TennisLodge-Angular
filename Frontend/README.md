# TennisLodge — Angular frontend

This folder contains the **Angular** single-page application for **TennisLodge** (Angular CLI **21.x**).

For the **Functional Guide**, prerequisites, and instructions to run the **full stack** (MongoDB, Express API, and this app), see the repository root **[`README.md`](../README.md)**.

---

## Prerequisites

- **Node.js** and **npm** (this project declares `packageManager: "npm@11.8.0"` in `package.json`).

## Install dependencies

```bash
npm install
```

## Development server

The dev server uses **`proxy.conf.json`**: requests to **`/api`** and **`/uploads`** are proxied to **`http://localhost:3000`**. Start the **Backend** API first (see the root `README.md`), then:

```bash
npm start
```

This runs **`ng serve`**. Open **`http://localhost:4200/`** (or the URL printed in the terminal if the port is taken).

## Build

```bash
npm run build
```

Runs **`ng build`**; output goes under `dist/` (see `angular.json`).

## Unit tests

```bash
npm test
```

Runs **`ng test`** (Vitest per Angular 21 setup).

## Watch mode (development build)

```bash
npm run watch
```

Runs **`ng build --watch`** with the development configuration.

---

## Project metadata

- Generated with [Angular CLI](https://github.com/angular/angular-cli); CLI version **21.1.5** (see `devDependencies` in `package.json`).
- Application project name: **`tennis-lodge`** (`angular.json`).

For Angular CLI help (schematics, generators):

```bash
npx ng generate --help
```

Additional CLI documentation: [Angular CLI overview](https://angular.dev/tools/cli).
