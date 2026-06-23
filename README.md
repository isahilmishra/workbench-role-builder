# Workbench Role Builder

This repository contains a full-stack prototype for the Workbench Role and Permission Builder, built using Next.js 14 (App Router) and TypeScript.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **In-Memory Backend**: The application runs completely locally using an in-memory Node.js store, pre-populated with sample users and roles.
- **Roles & Permissions Management**: Create, view, edit, and delete custom roles. System roles (Owner, Editor, Viewer) are protected from structural changes.
- **User Role Assignment**: Assign multiple roles to any user.
- **Effective Permissions Resolution**: Calculate the true effective permissions of a user who holds multiple overlapping roles using an additive (union) approach.
- **Premium UX**: Built using pure CSS Modules (no external UI libraries) to showcase strong foundational styling skills, featuring responsive grids, modal animations, and micro-interactions.

## Architecture Decisions

Please review [Architecture.md](./Architecture.md) for a detailed explanation of the stack choices and the additive permission resolution logic.
