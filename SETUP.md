# 🎯 Setup Panti BBS - Backend & Frontend

Panduan lengkap setup backend dan frontend untuk Panti BBS.

## 📋 Daftar Isi

1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [Testing](#testing)
4. [Troubleshooting](#troubleshooting)
5. [API Documentation](#api-documentation)

---

## Backend Setup

### Prerequisites

- Node.js v14+ (verify dengan `node --version`)
- npm v6+ (verify dengan `npm --version`)

### Langkah 1: Install Dependencies

```bash
cd backend
npm install
```

Output yang diharapkan:

```
added 72 packages, and audited 73 packages in 3s
found 0 vulnerabilities
```

### Langkah 2: Jalankan Server

```bash
npm start
```

atau dengan auto-reload (development):

```bash
npm run dev
```

**Output yang diharapkan:**

```
✅ Server berjalan di http://localhost:3000
📝 API docs: http://localhost:3000/api/{module}
❤️  Health check: http://localhost:3000/health
```

✅ **Backend siap!** Biarkan terminal ini tetap terbuka.

### Langkah 3: Verifikasi (Terminal Baru)

```bash
# Check health
curl http://localhost:3000/health

# Atau gunakan PowerShell
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/health' | Select -ExpandProperty Content"
```

Expected response:

```json
{ "status": "ok", "timestamp": "2025-11-12T..." }
```

---

## Frontend Setup

### Langkah 1: Install Dependencies (Terminal Baru)

```bash
cd FE-BBS
npm install
```

### Langkah 2: Jalankan Dev Server

```bash
npm run dev
```

Output:

```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

✅ **Frontend siap!** Buka browser ke `http://localhost:5173`

---

## Testing

### Manual API Test

**Test 1: Health Check**

```bash
curl http://localhost:3000/health
```

**Test 2: Get All Angpao**

```bash
curl http://localhost:3000/api/angpao
```

**Test 3: Create Angpao**

```bash
curl -X POST http://localhost:3000/api/angpao \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Angpao Test\",\"amount\":100000,\"description\":\"Test angpao\"}"
```

**Test 4: Update Angpao**

```bash
# Ganti {id} dengan ID dari response test 3
curl -X PUT http://localhost:3000/api/angpao/{id} \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Name\",\"amount\":200000}"
```

**Test 5: Delete Angpao**

```bash
curl -X DELETE http://localhost:3000/api/angpao/{id}
```

### PowerShell Alternative

```powershell
# Get all
$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/angpao' -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Create
$body = @{name='Test'; amount=100000; description='Test'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:3000/api/angpao' `
  -Method POST `
  -ContentType 'application/json' `
  -Body $body
```

---

## Troubleshooting

### ❌ Port 3000 sudah digunakan

**Solusi:**

```bash
# Option 1: Gunakan port berbeda
PORT=3001 npm start

# Option 2: Kill proses yang menggunakan port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# macOS/Linux:
lsof -i :3000
kill -9 {PID}
```

### ❌ CORS Error di Frontend

**Solusi:** Backend sudah dikonfigurasi dengan CORS. Jika masih error:

1. Pastikan frontend menggunakan URL `http://localhost:3000`
2. Cek console browser untuk detail error
3. Restart server backend

### ❌ Data tidak tersimpan

**Check:**

1. Folder `backend/data/` ada?

   ```bash
   ls -la backend/data/  # macOS/Linux
   dir backend\data      # Windows
   ```

2. File ada tapi kosong?

   ```bash
   cat backend/data/angpao.js
   ```

   Should show: `{"items":[]}`

3. Permission issue?
   - Pastikan folder writable
   - Cek folder properties > Security > Permissions

### ❌ Cannot find module error

**Solusi:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ Server crash saat test

**Cause:** Race condition atau interrupt signal

**Solusi:**

```bash
# Restart server
npm start

# Test di terminal terpisah
curl http://localhost:3000/health
```

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Available Modules

```
✅ angpao
✅ berita
✅ deposit
✅ galery
✅ gen
✅ history_kesehatan
✅ kary
✅ penghuni
✅ pengurus
✅ pondokan
✅ realisasi_pondokan
✅ user_default
```

### Endpoints

#### 1. GET /api/{module}

Ambil semua items dari sebuah modul.

**Request:**

```http
GET /api/angpao
```

**Response (200):**

```json
{
  "module": "angpao",
  "total": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Angpao Tahun Baru",
      "amount": 500000,
      "description": "Untuk tahun baru",
      "createdAt": "2025-11-12T10:00:00.000Z",
      "updatedAt": "2025-11-12T10:00:00.000Z"
    }
  ]
}
```

#### 2. GET /api/{module}/{id}

Ambil item spesifik.

**Request:**

```http
GET /api/angpao/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**

```json
{
  "module": "angpao",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Angpao Tahun Baru",
    ...
  }
}
```

**Response (404):**

```json
{
  "error": "Item dengan ID ... tidak ditemukan"
}
```

#### 3. POST /api/{module}

Buat item baru.

**Request:**

```http
POST /api/angpao
Content-Type: application/json

{
  "name": "Angpao Tahun Baru 2026",
  "amount": 500000,
  "description": "Angpao untuk tahun baru"
}
```

**Response (201):**

```json
{
  "module": "angpao",
  "message": "Item berhasil dibuat",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Angpao Tahun Baru 2026",
    "amount": 500000,
    "description": "Angpao untuk tahun baru",
    "createdAt": "2025-11-12T11:00:00.000Z",
    "updatedAt": "2025-11-12T11:00:00.000Z"
  }
}
```

#### 4. PUT /api/{module}/{id}

Update item.

**Request:**

```http
PUT /api/angpao/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "amount": 600000
}
```

**Response (200):**

```json
{
  "module": "angpao",
  "message": "Item berhasil diperbarui",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Angpao Tahun Baru 2026",
    "amount": 600000,
    "description": "Angpao untuk tahun baru",
    "createdAt": "2025-11-12T11:00:00.000Z",
    "updatedAt": "2025-11-12T11:05:00.000Z"
  }
}
```

#### 5. DELETE /api/{module}/{id}

Hapus item.

**Request:**

```http
DELETE /api/angpao/550e8400-e29b-41d4-a716-446655440001
```

**Response (200):**

```json
{
  "module": "angpao",
  "message": "Item berhasil dihapus",
  "data": { ... }
}
```

---

## Frontend Integration Example

### 1. Create API Service

**File: `src/services/api.js`**

```javascript
const API_BASE = "http://localhost:3000/api";

export const apiService = {
  async getAll(module) {
    const response = await fetch(`${API_BASE}/${module}`);
    if (!response.ok) throw new Error(`Failed to fetch ${module}`);
    const data = await response.json();
    return data.data;
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

### 2. Update Composable

**Example: `src/views/angpao/useAngpaoManagement.js`**

```javascript
import { ref, onMounted } from "vue";
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
      console.error("Error fetching angpaos:", err);
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload) => {
    try {
      loading.value = true;
      error.value = null;
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
      error.value = null;
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
      error.value = null;
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

---

## Project Structure

```
panti_tesbe/
├── backend/                          # Backend Express server
│   ├── node_modules/
│   ├── data/                         # JSON data files (auto-created)
│   │   ├── angpao.js
│   │   ├── berita.js
│   │   └── ... (modul lainnya)
│   ├── lib/
│   │   └── dataStore.js             # Data access layer
│   ├── routes/
│   │   └── modules.js               # REST routes
│   ├── server.js                    # Express server entry
│   ├── package.json
│   └── README.md
│
├── FE-BBS/                          # Frontend Vue 3 app
│   ├── node_modules/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js              # Backend API client (to create)
│   │   ├── views/                  # Views per modul
│   │   ├── components/
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
└── SETUP.md                        # File ini
```

---

## Summary

| Component         | Status        | Port | Command                             |
| ----------------- | ------------- | ---- | ----------------------------------- |
| Backend (Node.js) | ✅ Ready      | 3000 | `cd backend && npm start`           |
| Frontend (Vue 3)  | ✅ Ready      | 5173 | `cd FE-BBS && npm run dev`          |
| API               | ✅ Live       | 3000 | `curl http://localhost:3000/health` |
| Data              | ✅ File-based | -    | `backend/data/*.js`                 |

---

## Next Steps

1. ✅ Backend sudah jalan di http://localhost:3000
2. ✅ Frontend siap di http://localhost:5173
3. 📝 Integrate API service ke Vue components
4. 🧪 Test CRUD operations
5. 🚀 Deploy ke production

---

**Happy coding! 🎉**
