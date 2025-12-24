# Backend API Reference

Backend Panti BBS menggunakan REST API dengan pattern CRUD yang sederhana.

## Quick Reference

| Method | Endpoint             | Purpose         |
| ------ | -------------------- | --------------- |
| GET    | `/api/{module}`      | Get all items   |
| GET    | `/api/{module}/{id}` | Get single item |
| POST   | `/api/{module}`      | Create item     |
| PUT    | `/api/{module}/{id}` | Update item     |
| DELETE | `/api/{module}/{id}` | Delete item     |
| GET    | `/health`            | Health check    |

## Response Format

Semua response adalah JSON dengan struktur:

### Success Response

```json
{
  "module": "angpao",
  "data": { ... } atau [...],
  "message": "... (opsional)",
  "total": 5
}
```

### Error Response

```json
{
  "error": "Deskripsi error"
}
```

## HTTP Status Codes

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 200  | OK - Request berhasil              |
| 201  | Created - Item berhasil dibuat     |
| 400  | Bad Request - Payload tidak valid  |
| 404  | Not Found - Item tidak ditemukan   |
| 500  | Server Error - Ada error di server |

## Module List

Backend support 12 modul:

```
1. angpao              - Angpao/Pemberian uang
2. berita              - Berita/Pengumuman
3. deposit             - Deposit/Dana masuk
4. galery              - Galeri/Foto
5. gen                 - General/Umum
6. history_kesehatan   - Riwayat kesehatan
7. kary                - Karyawan
8. penghuni            - Penghuni/Asrama
9. pengurus            - Pengurus/Staff
10. pondokan           - Pondokan/Akomodasi
11. realisasi_pondokan - Realisasi pondokan
12. user_default       - Default user
```

## Item Structure

Setiap item memiliki struktur dasar:

```json
{
  "id": "uuid-string",
  "createdAt": "ISO-8601-timestamp",
  "updatedAt": "ISO-8601-timestamp",
  "... custom fields ..."
}
```

**Note**: Field `id`, `createdAt`, dan `updatedAt` otomatis di-generate oleh server.

## Usage Examples

### Example 1: Ambil semua berita

```javascript
fetch("http://localhost:3000/api/berita")
  .then((r) => r.json())
  .then((data) => {
    console.log(`Total: ${data.total} berita`);
    data.data.forEach((berita) => {
      console.log(`- ${berita.name} (${berita.createdAt})`);
    });
  });
```

### Example 2: Buat item baru

```javascript
const newBerita = {
  name: "Pengumuman Penting",
  content: "Isi berita di sini",
  author: "Admin",
};

fetch("http://localhost:3000/api/berita", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newBerita),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Berita berhasil dibuat:", data.data.id);
  });
```

### Example 3: Update item

```javascript
const updates = {
  name: "Pengumuman Penting - Update",
  content: "Konten yang sudah diperbarui",
};

fetch("http://localhost:3000/api/berita/550e8400-e29b-41d4-a716-446655440000", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updates),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Updated at:", data.data.updatedAt);
  });
```

### Example 4: Hapus item

```javascript
fetch("http://localhost:3000/api/berita/550e8400-e29b-41d4-a716-446655440000", {
  method: "DELETE",
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Item deleted:", data.data.id);
  });
```

## Error Handling

Selalu handle error di fetch:

```javascript
fetch("http://localhost:3000/api/berita/invalid-id")
  .then((r) => {
    if (!r.ok) {
      return r.json().then((err) => Promise.reject(err));
    }
    return r.json();
  })
  .then((data) => console.log(data))
  .catch((error) => {
    console.error("Error:", error.error);
  });
```

## CORS

Backend sudah enabled CORS untuk:

- Origin: `http://localhost:*`
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type

## Rate Limiting

Tidak ada rate limiting, tapi jangan overload dengan 1000+ requests per detik.

## Data Persistence

Data disimpan di file JSON di folder `backend/data/`:

```
backend/data/
├── angpao.js              (contains: {"items": [...]})
├── berita.js
├── deposit.js
└── ... (modul lainnya)
```

File di-update real-time ketika ada perubahan data.

## Field Examples per Modul

### Angpao

```json
{
  "id": "...",
  "name": "Angpao Tahun Baru",
  "amount": 500000,
  "description": "Untuk tahun baru",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Berita

```json
{
  "id": "...",
  "title": "Pengumuman Penting",
  "content": "Isi berita...",
  "author": "Admin",
  "publishedDate": "2025-11-12",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Karyawan

```json
{
  "id": "...",
  "name": "Budi Santoso",
  "position": "Kepala Asrama",
  "email": "budi@panti.id",
  "phone": "081234567890",
  "hireDate": "2020-01-15",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Penghuni

```json
{
  "id": "...",
  "name": "Ahmad Rizki",
  "usia": 16,
  "gender": "Laki-laki",
  "kamarNo": "A-101",
  "statusKesehatan": "Sehat",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Tips

1. **Gunakan Postman**: Download Postman untuk test API lebih mudah
2. **JSON Format**: Pastikan Content-Type: application/json pada POST/PUT
3. **ID Format**: ID adalah UUID v4 string, jangan modify
4. **Timestamps**: Format adalah ISO-8601, auto-generated oleh server
5. **Field Flexibility**: Bisa add custom field sesuai kebutuhan modul
6. **Validation**: Server minimal validate body tidak kosong, custom validation bisa di-add di composable

## Limitations

- Tidak ada pagination (return semua items)
- Tidak ada filtering/search (handle di frontend)
- Tidak ada authentication (add di fase production)
- Tidak ada backup otomatis (backup file `data/` secara manual)
- File-based storage tidak cocok untuk data sangat besar

## Future Improvements

- [ ] Add database (MongoDB/PostgreSQL)
- [ ] Add authentication & authorization
- [ ] Add pagination & filtering
- [ ] Add file upload support
- [ ] Add data validation middleware
- [ ] Add logging & monitoring
- [ ] Add API documentation (Swagger/OpenAPI)
