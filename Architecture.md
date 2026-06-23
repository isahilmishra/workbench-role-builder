# Workbench Architecture

## Tech Stack

The application is built as a single unified full-stack application using **Next.js 14 (App Router)** and **TypeScript**.

### Frontend
- **Framework**: Next.js App Router. It allows for an intuitive filesystem-based routing approach and server/client component boundaries, which optimizes initial loads while preserving interactive richness where needed (e.g., modals, form interactions).
- **Styling**: Pure CSS Modules. In keeping with a desire for maximum flexibility and control without heavy dependencies (e.g., Tailwind CSS), the application implements a custom design system using CSS variables (`globals.css`). This approach ensures encapsulation (`page.module.css`) to prevent styles from leaking across the platform, while still providing a premium, modern aesthetic through shared design tokens.
- **State Management**: React's native `useState` and `useEffect` are sufficient for this prototype scale. Data fetching relies on native `fetch` API calls to our backend routes.

### Backend
- **Framework**: Next.js Route Handlers (`app/api/.../route.ts`). Instead of setting up a separate Express server, Next.js provides the ability to co-locate the API with the frontend, significantly reducing deployment complexity and context switching during development.
- **Datastore**: Node.js In-Memory Store (`lib/db.ts`). As per the requirements, no persistent database was strictly required. I implemented a singleton object on the Node.js `global` scope. This ensures that the data persists across Hot Module Replacement (HMR) reloads during local development while mimicking the behavior of a real database.

---

## Overlapping Permissions Logic

When a user is assigned multiple roles, their effective permissions are calculated using an **Additive (Union) approach**. 

### The Decision
If Role A grants the ability to `view` Projects, and Role B grants the ability to `create` and `edit` Projects, the user's final effective permissions for Projects will be `['view', 'create', 'edit']`.

### Reasoning
1. **Least Privilege Composition**: In modern RBAC (Role-Based Access Control) systems, roles are typically designed to grant privileges, not revoke them. By treating permissions as purely additive, administrators can create granular base roles (e.g., "Viewer", "Project Editor") and safely combine them without worrying that one role will unintentionally override or deny permissions granted by another.
2. **Predictability**: An additive approach is much easier for a user to mentally trace. If a user is given an "Editor" role, they expect to be able to edit. If we supported restrictive/denial permissions (e.g., Role B explicitly denies editing), it would create confusing edge cases that are difficult to visualize in the UI. 
3. **Simplicity of Resolution**: Calculating the union of Sets is computationally inexpensive (`O(N)` where N is the total number of permission assignments) and very easy to implement robustly.

Our implementation actively loops through every assigned role and merges the allowed action arrays into a Set for each resource, returning a cleanly deduplicated list of active permissions for the user.
