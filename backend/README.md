# Backend Panti BBS

Simple file-based backend server untuk modul Panti BBS.

## Fitur

- ✅ REST API CRUD untuk semua modul
- ✅ Data disimpan dalam file `.js` (CommonJS format)
- ✅ Auto-generated UUID untuk setiap item
- ✅ Timestamps (createdAt, updatedAt)
- ✅ CORS enabled

## Modul yang Tersedia

- angpao
- berita
- deposit
- galery
- gen (general)
- history_kesehatan
- kary (karyawan)
- penghuni
- pengurus
- pondokan
- realisasi_pondokan
- user_default

## Setup & Jalankan

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Mulai Server

```bash
npm start
```

atau dengan auto-reload (development):

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

## API Endpoints

### Get All Items

```http
GET /api/{module}
```

Contoh: `GET /api/angpao`

**Response:**

```json
{
  "module": "angpao",
  "total": 2,
  "data": [
    {
      "id": "uuid-1",
      "name": "Angpao Tahun Baru",
      "amount": 100000,
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    }
  ]
}
```

### Get Single Item

```http
GET /api/{module}/{id}
```

### Create Item

```http
POST /api/{module}
Content-Type: application/json

{
  "name": "Item Name",
  "description": "Item Description",
  "amount": 50000
}
```

**Response (201 Created):**

```json
{
  "module": "angpao",
  "message": "Item berhasil dibuat",
  "data": {
    "id": "uuid-...",
    "name": "Item Name",
    "description": "Item Description",
    "amount": 50000,
    "createdAt": "2025-11-12T...",
    "updatedAt": "2025-11-12T..."
  }
}
```

### Update Item

```http
PUT /api/{module}/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "amount": 75000
}
```

### Delete Item

```http
DELETE /api/{module}/{id}
```

## Health Check

```http
GET /health
```

## File Storage Structure

```
backend/
├── data/
│   ├── angpao.js
│   ├── berita.js
│   ├── deposit.js
│   └── ... (other modules)
├── lib/
│   └── dataStore.js (data access layer)
├── routes/
│   └── modules.js (REST routes)
├── server.js (Express server)
└── package.json
```

## Data Format

Setiap file di `data/` berbentuk CommonJS module:

```javascript
// data/angpao.js
module.exports = {
  items: [
    {
      id: "uuid-1",
      name: "...",
      createdAt: "2025-11-12T...",
      updatedAt: "2025-11-12T...",
    },
  ],
};
```

## Frontend Integration

Pada file frontend (Vue), gunakan API seperti ini:

```javascript
// GET all
fetch("http://localhost:3000/api/angpao")
  .then((r) => r.json())
  .then((data) => console.log(data.data));

// POST create
fetch("http://localhost:3000/api/angpao", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test", amount: 100 }),
});

// PUT update
fetch("http://localhost:3000/api/angpao/uuid-1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Updated" }),
});

// DELETE
fetch("http://localhost:3000/api/angpao/uuid-1", {
  method: "DELETE",
});
```

## Troubleshooting

### Port sudah digunakan

Gunakan port lain:

```bash
PORT=3001 npm start
```

### Module tidak ada

Akan otomatis dibuat saat pertama kali ada request ke module tersebut.

### Data tidak tersimpan

Cek folder `backend/data/` apakah file sudah terbuat.
