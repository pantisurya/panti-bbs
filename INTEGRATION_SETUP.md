# Frontend-Backend Integration Setup

## Overview

This document describes the integration between the Frontend (FE) and Backend (BE) for the Panti Surya application. Three main data modules have been integrated: **pengurus** (administrators), **berita** (news), and **galery** (gallery).

---

## Backend Changes

### 1. **Backend Routes** - `backend/routes/modules.js`

Added three new API endpoints to fetch data:

- **GET `/api/pengurus`** - Returns all pengurus (administrators) data
- **GET `/api/berita`** - Returns all berita (news) data
- **GET `/api/galery`** - Returns all galery (gallery) data

Each endpoint uses the `dataStore` to retrieve data from the respective data files and returns a JSON response with status and data.

Example response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "nama": "...",
      ...
    }
  ]
}
```

### 2. **Backend Server** - `backend/server.js`

The module routes are already registered in the server:

```javascript
const moduleRoutes = require("./routes/modules.js");
app.use("/api", moduleRoutes);
```

---

## Frontend Changes

### 1. **API Service** - `FE-LandingPage-Panti/src/services/api.js`

Created a new service file with helper functions to fetch data from the backend:

**Available functions:**

- `getPengurus()` - Fetch all pengurus data
- `getBerita()` - Fetch all berita data
- `getGalery()` - Fetch all galery data
- `getPengurusById(id)` - Fetch a specific pengurus by ID
- `getBeritaById(id)` - Fetch a specific berita by ID
- `getGaleryById(id)` - Fetch a specific galery by ID

All functions return a promise that resolves to the data array.

### 2. **Gallery Component** - `FE-LandingPage-Panti/src/Gallery.tsx`

Updated to use the new `getGalery()` function:

- Fetches gallery images from the backend API
- Displays them in a responsive grid
- Added error handling and loading states

### 3. **News Component** - `FE-LandingPage-Panti/src/News.tsx`

Updated to use the new `getBerita()` function:

- Fetches news articles from the backend API
- Filters news by category
- Displays them with proper formatting
- Added error handling and loading states

### 4. **About Component** - `FE-LandingPage-Panti/src/About.tsx`

Updated to use the new `getPengurus()` function:

- Fetches administrator/pengurus data from the backend API
- Groups pengurus by divisi (Pembina, Pengawas, Pengurus)
- Displays them in organized tables
- Added error handling and loading states

---

## API Configuration

**Backend URL:** `http://localhost:3000/api`

This can be modified in `FE-LandingPage-Panti/src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:3000/api";
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
node server.js
```

The server will start at `http://localhost:3000`

### Start Frontend Development Server

```bash
cd FE-LandingPage-Panti
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` (or another port if 5173 is in use)

---

## Data Sources

The three main data modules come from:

1. **Pengurus** - `backend/data/pengurus.js`

   - Contains administrator/board member information
   - Fields include: nama, jabatan, gereja, divisi, etc.

2. **Berita** - `backend/data/berita.js`

   - Contains news articles
   - Fields include: judul, isi_berita, gambar, kategori_id, status, etc.

3. **Galery** - `backend/data/galery.js`
   - Contains gallery images
   - Fields include: gambar, judul, etc.

---

## Error Handling

All API calls include error handling:

- Errors are logged to the console
- Components display loading states while fetching data
- If no data is returned, appropriate "No data found" messages are displayed
- Failed requests are gracefully handled without crashing the app

---

## Notes

- Ensure both backend and frontend servers are running for the integration to work properly
- Check browser console for any error messages if data is not loading
- The API uses CORS which is enabled in the backend server
- All API responses follow the same structure with `status` and `data` fields
