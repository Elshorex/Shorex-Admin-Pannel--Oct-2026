# Shorex Admin Panel Application (Admin Panel + Web UI)

## Overview

This frontend application is a **ReactJS (JSX)**–based system designed to work with the backend API you have already implemented. It serves as the **Admin Panel / Web Interface** for managing requests, warehouses, users, providers, and operational workflows.

The application is tightly coupled with the backend's advanced filtering, role-based access control, localization, and pagination mechanisms.

---

## Tech Stack

* **ReactJS (JSX)**
* **React Router DOM** – Routing
* **Axios** – API communication
* **Context API / Redux** (if used) – State management
* **Tailwind CSS / Bootstrap** (depending on your setup)
* **i18n** – Localization support

---

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level pages (Requests, Users, Warehouses, etc.)
│   ├── services/          # API service layer (Axios)
│   ├── hooks/             # Custom React hooks
│   ├── context/           # Global state / auth context
│   ├── utils/             # Helpers & constants
│   ├── i18n/              # Localization configuration
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env
└── package.json
```

---

## Environment Variables

Create a `.env` file in the root of the frontend project:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_DEFAULT_LANGUAGE=en
```

> Make sure the API base URL matches your backend server.

---

## Installation & Setup

```bash
npm install
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## Authentication Flow

* JWT-based authentication
* Token stored in **localStorage** or **cookies**
* Axios interceptor automatically attaches `Authorization: Bearer <token>`
* Unauthorized responses (401) trigger logout

---

## Core Features

### Request Management

* Advanced status-based views:

  * **ON_THE_WAY** (today + past)
  * **PENDING** (future only)
  * **COMPLETED / FAILED / HISTORY**
* Server-driven pagination
* Date range filtering (pickupDate)
* Search by:

  * Request ID
  * Customer name
  * Business name

### Filtering Parameters (Mapped to Backend)

```js
{
  status,
  customer,
  provider,
  warehouse,
  fromDateValue,
  toDateValue,
  filterDateKey: 'pickupDate',
  page,
  limit
}
```

---

## Role-Based UI Rendering

UI components dynamically adapt based on logged-in user role:

* **SUPER_ADMIN** – Full access
* **ADMIN** – Operational access
* **DRIVER / STORE_KEEPER** – Area-based restricted access

Unauthorized UI actions are hidden by default.

---

## Localization

* Language handled via i18n
* Backend returns localized payload unless `removeLanguage=true`
* Frontend supports runtime language switching

---

## API Integration Pattern

All API calls are abstracted via a service layer:

```js
// services/request.service.js
export const getRequests = (params) =>
  axios.get('/request', { params });
```

---

## Error Handling

* Centralized API error handler
* Graceful fallback UI for:

  * Empty data
  * Network failures
  * Permission errors

---

## Performance Considerations

* Debounced search inputs
* Server-side pagination
* Conditional rendering for heavy tables
* Memoized components where applicable

---

## Build for Production

```bash
npm run build
```

Output will be generated in the `dist/` folder.

---

## Common Issues

### No Data Returned

* Verify filters sent to API
* Check date format: `YYYY-MM-DD`
* Ensure `status` logic matches backend rules

### CORS Errors

* Confirm backend CORS configuration
* Validate API base URL

---

## Best Practices Followed

* Clean separation of concerns
* Backend-driven business logic
* Minimal frontend assumptions
* Scalable folder structure

---

## Future Enhancements

* React Query for caching
* Server-side rendering
* WebSocket live updates
* Permission matrix UI

---

## License

Private – Internal Use Only
