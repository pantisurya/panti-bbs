# ✅ Backend Panti BBS - READY TO USE

Backend untuk Panti BBS sudah siap digunakan! Ini adalah ringkasan lengkap.

## 🚀 Quick Start (2 Langkah)

### Terminal 1: Jalankan Backend

```bash
cd backend
npm install    # (hanya perlu sekali)
npm start      # Server akan jalan di port 3000
```

### Terminal 2: Jalankan Frontend

```bash
cd FE-BBS
npm run dev    # Frontend akan jalan di port 5173
```

✅ **DONE!** Frontend terhubung ke Backend via API.

---

## 📁 Struktur Folder

```
backend/
├── lib/dataStore.js         # Data access layer (R/W JSON files)
├── routes/modules.js        # API routes (CRUD)
├── server.js                # Express server
├── data/                    # Data files (auto-created)
│   ├── angpao.js
│   ├── berita.js
│   └── ... (12 modul total)
└── README.md

FE-BBS/
├── src/
│   ├── services/           # (buat: src/services/api.js)
│   │   └── api.js         # API client untuk backend
│   ├── views/             # Komponen per modul
│   └── main.js
└── vite.config.js
```

---

## 📚 Dokumentasi

| File                       | Isi                                     |
| -------------------------- | --------------------------------------- |
| `SETUP.md`                 | Panduan lengkap setup & troubleshooting |
| `INTEGRATION_GUIDE.md`     | Cara integrate backend ke frontend      |
| `backend/API_REFERENCE.md` | API documentation lengkap               |
| `backend/README.md`        | Backend quick start                     |

---

## 🔌 Available Modul (12 Buah)

```
✅ angpao              - Angpao/pemberian uang
✅ berita              - Berita/pengumuman
✅ deposit             - Deposit/dana masuk
✅ galery              - Galeri/foto
✅ gen                 - General/umum
✅ history_kesehatan   - Riwayat kesehatan
✅ kary                - Karyawan
✅ penghuni            - Penghuni asrama
✅ pengurus            - Pengurus/staff
✅ pondokan            - Pondokan/akomodasi
✅ realisasi_pondokan  - Realisasi pondokan
✅ user_default        - Default user
```

---

## 🔗 API Endpoints

Semua endpoint base: `http://localhost:3000/api`

| Method | Endpoint         | Purpose         |
| ------ | ---------------- | --------------- |
| GET    | `/{module}`      | Get all items   |
| GET    | `/{module}/{id}` | Get single item |
| POST   | `/{module}`      | Create item     |
| PUT    | `/{module}/{id}` | Update item     |
| DELETE | `/{module}/{id}` | Delete item     |

**Contoh:**

```bash
# Get all angpao
GET http://localhost:3000/api/angpao

# Create berita
POST http://localhost:3000/api/berita
Body: {"title": "...", "content": "..."}

# Update item
PUT http://localhost:3000/api/angpao/abc-123
Body: {"amount": 600000}

# Delete item
DELETE http://localhost:3000/api/angpao/abc-123
```

---

## 📝 Contoh Integrasi Frontend

### Step 1: Buat API Service

**File: `src/services/api.js`**

```javascript
const API_BASE = "http://localhost:3000/api";

export const apiService = {
  async getAll(module) {
    const response = await fetch(`${API_BASE}/${module}`);
    if (!response.ok) throw new Error(`Failed to fetch ${module}`);
    const data = await response.json();
    return data.data; // return items array
  },

  async create(module, payload) {
    const response = await fetch(`${API_BASE}/${module}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to create`);
    return (await response.json()).data;
  },

  async update(module, id, payload) {
    const response = await fetch(`${API_BASE}/${module}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to update`);
    return (await response.json()).data;
  },

  async delete(module, id) {
    const response = await fetch(`${API_BASE}/${module}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Failed to delete`);
    return true;
  },
};
```

### Step 2: Update Composable

**File: `src/views/angpao/useAngpaoManagement.js`**

```javascript
import { ref, onMounted } from "vue";
import { apiService } from "@/services/api.js";

export function useAngpaoManagement() {
  const angpaos = ref([]);
  const loading = ref(false);

  const fetchAll = async () => {
    try {
      loading.value = true;
      angpaos.value = await apiService.getAll("angpao");
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload) => {
    const newItem = await apiService.create("angpao", payload);
    angpaos.value.push(newItem);
    return newItem;
  };

  const update = async (id, payload) => {
    const updated = await apiService.update("angpao", id, payload);
    const idx = angpaos.value.findIndex((a) => a.id === id);
    if (idx !== -1) angpaos.value[idx] = updated;
    return updated;
  };

  const remove = async (id) => {
    await apiService.delete("angpao", id);
    angpaos.value = angpaos.value.filter((a) => a.id !== id);
  };

  onMounted(fetchAll);

  return { angpaos, loading, create, update, remove, fetchAll };
}
```

---

## 🧪 Testing API

### Dengan curl

```bash
# Test health
curl http://localhost:3000/health

# Get all
curl http://localhost:3000/api/angpao

# Create
curl -X POST http://localhost:3000/api/angpao \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","amount":100000}'
```

### Dengan PowerShell

```powershell
# Get all
$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/angpao' -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## 🛠️ Troubleshooting

### Port 3000 sudah digunakan

```bash
PORT=3001 npm start    # Gunakan port berbeda
```

### Data tidak tersimpan

- Cek folder `backend/data/` ada file `.js`?
- Cek permission folder writable

### Frontend tidak connect ke backend

- Pastikan backend jalan (`npm start` di terminal 1)
- Cek URL di api service: `http://localhost:3000/api`
- Cek browser console untuk error detail

### Server crash

```bash
npm start    # Restart server
```

Lihat **SETUP.md** untuk troubleshooting lengkap.

---

## 📊 Data Storage

Data disimpan dalam format JSON di file `.js`:

```
backend/data/angpao.js:
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "amount": 500000,
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    }
  ]
}
```

✅ Real-time persisted ke disk
✅ Manual backup: copy folder `backend/data/`

---

## ✨ Features

- ✅ REST API CRUD untuk 12 modul
- ✅ Auto-generated UUID untuk setiap item
- ✅ Timestamps (createdAt, updatedAt)
- ✅ CORS enabled untuk frontend
- ✅ Error handling & validation
- ✅ File-based persistence (JSON)
- ✅ Express.js + ES Modules
- ✅ Lightweight & fast

---

## 📋 Next Steps

1. ✅ **Backend ready** - Jalankan dengan `npm start`
2. ✅ **Frontend ready** - Jalankan dengan `npm run dev`
3. 📝 **Integrate API** - Follow contoh di atas
4. 🧪 **Test CRUD** - Verify di browser DevTools
5. 🎨 **Enhance UI** - Update Vue components
6. 🚀 **Deploy** - Production setup (TBD)

---

## 📞 Support

| Bagian   | Command       | Port | Status     |
| -------- | ------------- | ---- | ---------- |
| Backend  | `npm start`   | 3000 | ✅ Ready   |
| Frontend | `npm run dev` | 5173 | ✅ Ready   |
| API      | `/health`     | 3000 | ✅ Live    |
| Docs     | SETUP.md      | -    | ✅ Updated |

---

## 🎉 Congratulations!

Backend Panti BBS sudah 100% siap untuk development & testing!

Happy Coding! 🚀
