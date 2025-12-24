# Integrasi Backend Panti BBS dengan Frontend

Panduan cara mengintegrasikan backend API dengan frontend Vue.js.

## Quick Start Backend

### 1. Terminal 1 - Jalankan Backend Server

```bash
cd backend
npm install  # (hanya perlu sekali)
npm start    # atau: node server.js
```

Output yang diharapkan:

```
✅ Server berjalan di http://localhost:3000
📝 API docs: http://localhost:3000/api/{module}
❤️  Health check: http://localhost:3000/health
```

### 2. Terminal 2 - Jalankan Frontend

```bash
cd FE-BBS
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Available Modules

- `angpao`
- `berita`
- `deposit`
- `galery`
- `gen`
- `history_kesehatan`
- `kary`
- `penghuni`
- `pengurus`
- `pondokan`
- `realisasi_pondokan`
- `user_default`

### GET - Semua Items

```
GET /api/{module}
```

Contoh:

```javascript
fetch("http://localhost:3000/api/angpao")
  .then((r) => r.json())
  .then((data) => console.log(data.data));
```

**Response:**

```json
{
  "module": "angpao",
  "total": 1,
  "data": [
    {
      "id": "uuid-...",
      "name": "Angpao Tahun Baru",
      "amount": 500000,
      "description": "...",
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    }
  ]
}
```

### GET - Single Item

```
GET /api/{module}/{id}
```

### POST - Create Item

```
POST /api/{module}
Content-Type: application/json

{
  "name": "Angpao Tahun Baru 2026",
  "amount": 500000,
  "description": "Untuk tahun baru"
}
```

**Response (201):**

```json
{
  "module": "angpao",
  "message": "Item berhasil dibuat",
  "data": {
    "id": "uuid-...",
    "name": "Angpao Tahun Baru 2026",
    "amount": 500000,
    "description": "Untuk tahun baru",
    "createdAt": "2025-11-12T...",
    "updatedAt": "2025-11-12T..."
  }
}
```

### PUT - Update Item

```
PUT /api/{module}/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "amount": 600000
}
```

### DELETE - Remove Item

```
DELETE /api/{module}/{id}
```

## Frontend Integration Examples

### Setup API Service

Buat file `src/services/api.js`:

```javascript
// src/services/api.js
const API_BASE = "http://localhost:3000/api";

export const apiService = {
  async getAll(module) {
    const response = await fetch(`${API_BASE}/${module}`);
    if (!response.ok) throw new Error(`Failed to fetch ${module}`);
    const data = await response.json();
    return data.data; // return items array
  },

  async getById(module, id) {
    const response = await fetch(`${API_BASE}/${module}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch ${module}/${id}`);
    const data = await response.json();
    return data.data;
  },

  async create(module, payload) {
    const response = await fetch(`${API_BASE}/${module}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to create ${module}`);
    const data = await response.json();
    return data.data;
  },

  async update(module, id, payload) {
    const response = await fetch(`${API_BASE}/${module}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to update ${module}/${id}`);
    const data = await response.json();
    return data.data;
  },

  async delete(module, id) {
    const response = await fetch(`${API_BASE}/${module}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Failed to delete ${module}/${id}`);
    return true;
  },
};
```

### Gunakan di Vue Component

```javascript
// contoh di useAngpaoManagement.js
import { apiService } from "@/services/api.js";

export function useAngpaoManagement() {
  const angpaos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAll = async () => {
    try {
      loading.value = true;
      error.value = null;
      angpaos.value = await apiService.getAll("angpao");
    } catch (err) {
      error.value = err.message;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload) => {
    try {
      loading.value = true;
      const newItem = await apiService.create("angpao", payload);
      angpaos.value.push(newItem);
      return newItem;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id, payload) => {
    try {
      loading.value = true;
      const updated = await apiService.update("angpao", id, payload);
      const idx = angpaos.value.findIndex((a) => a.id === id);
      if (idx !== -1) angpaos.value[idx] = updated;
      return updated;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id) => {
    try {
      loading.value = true;
      await apiService.delete("angpao", id);
      angpaos.value = angpaos.value.filter((a) => a.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchAll);

  return {
    angpaos,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
}
```

## Testing API Secara Manual

### Dengan curl (Windows)

```bash
# Health check
curl -i http://localhost:3000/health

# Get all
curl -i http://localhost:3000/api/angpao

# Create
curl -X POST http://localhost:3000/api/angpao ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"amount\":100000}"

# Update
curl -X PUT http://localhost:3000/api/angpao/{id} ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Updated\"}"

# Delete
curl -X DELETE http://localhost:3000/api/angpao/{id}
```

### Dengan PowerShell

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:3000/health

# Get all
Invoke-WebRequest -Uri http://localhost:3000/api/angpao | Select -ExpandProperty Content

# Create
$body = @{name='Test'; amount=100000} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3000/api/angpao `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## Troubleshooting

### Port 3000 sudah digunakan

Ganti port:

```bash
PORT=3001 npm start
```

### CORS Error di Frontend

Backend sudah dikonfigurasi dengan CORS enabled. Jika masih error, cek URL di frontend match dengan server URL.

### Data tidak tersimpan

- Cek folder `backend/data/` apakah file sudah dibuat
- Pastikan file punya akses write
- Cek di server console apakah ada error message

### Server crash saat test

Jika server crash ketika menjalankan test, coba restart dengan:

```bash
npm start
```

## Data Persistence

Data disimpan di folder `backend/data/` dengan format JSON:

```
backend/
└── data/
    ├── angpao.js      (format: {"items": [...]})
    ├── berita.js
    ├── deposit.js
    └── ... (modul lainnya)
```

Setiap file berisi array `items` yang dapat diakses langsung dari Explorer jika perlu debugging.
