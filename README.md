# Workbench: Custom Role & Permission Builder

🚀 **Live Demo:** [https://workbench-role-builder-2v2m0emji-sahil-m-projects1.vercel.app/](https://workbench-role-builder-2v2m0emji-sahil-m-projects1.vercel.app/)

Welcome to the **Workbench Role & Permission Builder**, a full-stack prototype designed to handle custom granular access control for SaaS platforms. This application allows team administrators to define custom roles, map them to a rigid permissions matrix, and assign these roles to users with overlapping resolution.

---

## 🚀 Quick Start

This project is built using Next.js 14 and requires Node.js (v18+ recommended).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/isahilmishra/workbench-role-builder.git
   cd workbench-role-builder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser. No database configuration or environment variables are required—the backend relies on an embedded in-memory datastore for ease of evaluation.

---

## 🎯 Features & Capabilities

The assignment requested four end-to-end flows, all of which are fully functional:

1. **Permissions Matrix View:** Automatically fetches and maps a predefined list of Actions (view, create, edit, delete, assign, etc.) against core Resources (Projects, Tasks, Members, Billing, Settings).
2. **Custom Role Builder:** A dedicated UI flow allowing admins to easily select permissions from the matrix using interactive checkboxes to formulate new roles (e.g., "Marketing Contractor").
3. **User Assignment:** A robust User Management page where admins can view sample users and attach or remove multiple roles at once.
4. **Effective Permissions Resolution:** When a user is assigned multiple overlapping roles (e.g., an Editor role and a Viewer role), the system correctly calculates and displays their true "Effective Permissions" by taking the **union** of all their roles.

### 🌟 Premium UX & Polish
This project stands out by delivering a highly refined user experience without relying on external component libraries like Tailwind, MUI, or Bootstrap.
- **Pure CSS Modules:** Demonstrates strong foundational styling capability with custom CSS variables, flexbox/grid layouts, and responsive design.
- **Interactive Feedback:** Features custom Toast notifications for success states, modal entrance animations, and sleek CSS loading spinners.
- **Error Prevention:** System roles (like the default 'Owner') are protected against deletion or structural edits.

---

## 🏗️ Technical Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript.
- **Backend API:** Next.js Route Handlers (`/api/roles`, `/api/users`, etc.) using RESTful conventions.
- **Database:** Singleton In-Memory Node.js Store (`src/lib/db.ts`) containing preloaded seed data.
- **Styling:** CSS Modules (`*.module.css`) with global design tokens.

---

## 🧠 Architecture & Decisions

For a deep dive into why Next.js was chosen and the logical reasoning behind our **Additive (Union)** approach to resolving overlapping permissions, please refer to the [Architecture.md](./Architecture.md) document included in this repository.
