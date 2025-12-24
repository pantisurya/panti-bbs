import express from "express";
import { dataStore } from "../lib/dataStore.js";

const router = express.Router();

// Helper: map frontend dynamic path to module name used in data files
function normalizeModuleFromPath(path) {
  // path could be e.g. 'm_gen', 't_angpao', 'berita', 'm_role/with-details'
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  // pick last non 'with-details' segment
  let last = parts[parts.length - 1];
  if (last === "with-details" && parts.length > 1) last = parts[parts.length - 2];
  // strip common prefixes like m_ or t_
  last = last.replace(/^[mt]_/, "");
  return last;
}

// Prefer explicit dynamic/:module/:id routes so id lookups don't get swallowed by wildcard
router.get("/dynamic/:mod/:id", async (req, res) => {
  try {
    const raw = req.params.mod || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    const item = await dataStore.getById(module, id);
    if (!item) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    res.json({ status: "success", module, data: item });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/dynamic/:mod/:id", async (req, res) => {
  try {
    const raw = req.params.mod || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) return res.status(400).json({ status: "error", message: "Body tidak boleh kosong" });
    if (module === "user_default") {
      if (payload.name !== undefined && !payload.name.trim()) return res.status(400).json({ status: "error", message: "Field 'name' tidak boleh kosong" });
      if (payload.username !== undefined && !payload.username.trim()) return res.status(400).json({ status: "error", message: "Field 'username' tidak boleh kosong" });
    }
    const updated = await dataStore.update(module, id, payload);
    if (!updated) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    res.json({ status: "success", module, message: "Item berhasil diperbarui", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/dynamic/:mod/:id", async (req, res) => {
  try {
    const raw = req.params.mod || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    const deleted = await dataStore.delete(module, id);
    if (!deleted) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    res.json({ status: "success", module, message: "Item berhasil dihapus", data: deleted });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Specific routes for pengurus, berita, and galery
router.get("/pengurus", async (req, res) => {
  try {
    let items = await dataStore.getAll("pengurus");

    // Support include=m_gen to enrich pengurus with related gen entries (jabatan/divisi/gereja)
    const includeStr = req.query.include || "";
    if (
      includeStr &&
      includeStr
        .split(",")
        .map((s) => s.trim())
        .includes("m_gen") &&
      items.length > 0
    ) {
      items = await Promise.all(
        items.map(async (item) => {
          const enriched = { ...item };
          if (item.jabatan_id) {
            const jab = await dataStore.getById("gen", item.jabatan_id);
            if (jab) enriched.jabatan = jab;
          }
          if (item.divisi_id) {
            const div = await dataStore.getById("gen", item.divisi_id);
            if (div) enriched.divisi = div;
          }
          if (item.gereja_id) {
            const ger = await dataStore.getById("gen", item.gereja_id);
            if (ger) enriched.gereja = ger;
          }
          return enriched;
        })
      );
    }

    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/berita", async (req, res) => {
  try {
    const items = await dataStore.getAll("berita");
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/galery", async (req, res) => {
  try {
    const items = await dataStore.getAll("galery");
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Support frontend paths like /api/dynamic/m_gen or /api/dynamic/t_angpao
router.get("/dynamic/*", async (req, res) => {
  try {
    const raw = req.params[0] || "";
    const module = normalizeModuleFromPath(raw);
    let items = await dataStore.getAll(module);

    // Apply simple filtering based on query params (search and status filters)
    const searchTerm = (req.query.search || "").toString().trim().toLowerCase();
    const searchField = (req.query.searchfield || "").toString();

    // Helper to normalize status filter values into boolean (true for active, false for inactive)
    const parseStatusFilter = (v) => {
      if (v === undefined || v === null) return null;
      const s = String(v).toLowerCase();
      if (s === "1" || s === "true" || s === "active") return true;
      if (s === "0" || s === "false" || s === "inactive") return false;
      return null;
    };

    const statusFilterRaw = req.query.filter_column_status ?? req.query.filter_column_status_id ?? null;
    const statusFilter = parseStatusFilter(statusFilterRaw);

    // Filter by group column (for gen/m_gen data)
    const groupFilter = req.query.filter_column_group ?? null;

    if (searchTerm) {
      const fields = searchField
        ? searchField
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;
      items = items.filter((it) => {
        if (!fields || fields.length === 0) {
          // If no specific field, check common fields
          return Object.values(it).some((val) => (val || "").toString().toLowerCase().includes(searchTerm));
        }
        return fields.some((f) => (it[f] || "").toString().toLowerCase().includes(searchTerm));
      });
    }

    if (statusFilter !== null) {
      items = items.filter((it) => {
        // treat undefined as false
        const val = it.status;
        const itemStatus = Boolean(val === true || val === 1 || String(val).toLowerCase() === "true" || String(val) === "1");
        return itemStatus === statusFilter;
      });
    }

    if (groupFilter) {
      items = items.filter((it) => it.group === groupFilter);
    }

    // Filter by key1 column
    const key1Filter = req.query.filter_column_key1 ?? null;
    if (key1Filter) {
      items = items.filter((it) => it.key1 === key1Filter);
    }
    try {
      console.log(`[modules] module=${module} query=${JSON.stringify(req.query)} filtered=${items.length}`);
      console.log(
        `[modules] items statuses:`,
        items.map((i) => ({ id: i.id, status: i.status }))
      );
    } catch (e) {
      // ignore logging errors
    }

    // Handle include parameter untuk relasi
    const includeStr = req.query.include || "";
    if (includeStr && items.length > 0) {
      const includes = includeStr.split(",").map((s) => s.trim());
      items = await Promise.all(
        items.map(async (item) => {
          let enrichedItem = { ...item };
          for (const inc of includes) {
            if (inc === "m_penghuni" && item.m_penghuni_id) {
              const penghuni = await dataStore.getById("penghuni", item.m_penghuni_id);
              if (penghuni) enrichedItem.m_penghuni = penghuni;
            }
            // Handle m_gen from several possible foreign keys
            else if (inc === "m_gen") {
              // Common fk fields that reference m_gen entries
              const fkCandidates = ["m_gen_id", "status_id", "kategori_id", "jenis_transaksi_id", "kategori", "jabatan_id", "divisi_id", "agama_id", "gereja_id", "tingkat_ketergantungan_id", "jenis_laporan_id"];
              // For pengurus/karyawan we want to include jabatan and divisi separately
              let jabatanData = null;
              let divisiData = null;
              let agamaData = null;
              let gerejaData = null;
              let tingkatKetergantunganData = null;
              let kategoriData = null;

              if (item.jabatan_id) {
                jabatanData = await dataStore.getById("gen", item.jabatan_id);
              }
              if (item.divisi_id) {
                divisiData = await dataStore.getById("gen", item.divisi_id);
              }
              if (item.agama_id) {
                agamaData = await dataStore.getById("gen", item.agama_id);
              }
              if (item.gereja_id) {
                gerejaData = await dataStore.getById("gen", item.gereja_id);
              }
              if (item.tingkat_ketergantungan_id) {
                tingkatKetergantunganData = await dataStore.getById("gen", item.tingkat_ketergantungan_id);
              }
              if (item.kategori_id) {
                kategoriData = await dataStore.getById("gen", item.kategori_id);
              }

              if (jabatanData) enrichedItem.jabatan = jabatanData;
              if (divisiData) enrichedItem.divisi = divisiData;
              if (agamaData) enrichedItem.agama = agamaData;
              if (gerejaData) enrichedItem.gereja = gerejaData;
              if (tingkatKetergantunganData) enrichedItem.tingkat_ketergantungan = tingkatKetergantunganData;
              if (kategoriData) enrichedItem.kategori = kategoriData;

              // Also check other fk candidates for backward compatibility
              for (const fk of fkCandidates) {
                const fkVal = item[fk];
                if (fkVal && !["jabatan_id", "divisi_id", "agama_id", "gereja_id", "tingkat_ketergantungan_id", "jenis_laporan_id", "kategori_id"].includes(fk)) {
                  const gen = await dataStore.getById("gen", fkVal);
                  if (gen) {
                    enrichedItem.m_gen = gen;
                    break;
                  }
                }
              }
            }
          }
          return enrichedItem;
        })
      );
    }

    // Extract pagination params from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Paginate if needed
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    res.json({
      status: "success",
      module,
      total: items.length,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/dynamic/*/:id", async (req, res) => {
  try {
    const raw = req.params[0] || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    let item = await dataStore.getById(module, id);
    if (!item) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });

    // Handle include parameter
    const includeStr = req.query.include || "";
    if (includeStr) {
      const includes = includeStr.split(",").map((s) => s.trim());
      for (const inc of includes) {
        if (inc === "m_penghuni" && item.m_penghuni_id) {
          const penghuni = await dataStore.getById("penghuni", item.m_penghuni_id);
          if (penghuni) item.m_penghuni = penghuni;
        }
        // Handle m_gen from several possible foreign keys
        else if (inc === "m_gen") {
          const fkCandidates = ["m_gen_id", "status_id", "kategori_id", "jenis_transaksi_id", "kategori", "jabatan_id", "divisi_id", "agama_id", "gereja_id", "tingkat_ketergantungan_id", "jenis_laporan_id"];
          // For pengurus/karyawan we want to include jabatan and divisi separately
          let jabatanData = null;
          let divisiData = null;
          let agamaData = null;
          let gerejaData = null;
          let tingkatKetergantunganData = null;

          if (item.jabatan_id) {
            jabatanData = await dataStore.getById("gen", item.jabatan_id);
          }
          if (item.divisi_id) {
            divisiData = await dataStore.getById("gen", item.divisi_id);
          }
          if (item.agama_id) {
            agamaData = await dataStore.getById("gen", item.agama_id);
          }
          if (item.gereja_id) {
            gerejaData = await dataStore.getById("gen", item.gereja_id);
          }
          if (item.tingkat_ketergantungan_id) {
            tingkatKetergantunganData = await dataStore.getById("gen", item.tingkat_ketergantungan_id);
          }

          if (jabatanData) item.jabatan = jabatanData;
          if (divisiData) item.divisi = divisiData;
          if (agamaData) item.agama = agamaData;
          if (gerejaData) item.gereja = gerejaData;
          if (tingkatKetergantunganData) item.tingkat_ketergantungan = tingkatKetergantunganData;

          // Also check other fk candidates for backward compatibility
          for (const fk of fkCandidates) {
            const fkVal = item[fk];
            if (fkVal && !["jabatan_id", "divisi_id", "agama_id", "gereja_id", "tingkat_ketergantungan_id", "jenis_laporan_id"].includes(fk)) {
              const gen = await dataStore.getById("gen", fkVal);
              if (gen) {
                item.m_gen = gen;
                break;
              }
            }
          }
        }
      }
    }

    res.json({ status: "success", module, data: item });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/dynamic/*", async (req, res) => {
  try {
    const raw = req.params[0] || "";
    const module = normalizeModuleFromPath(raw);
    const payload = req.body;
    console.log(`[POST /dynamic/*] raw="${raw}", module="${module}", payload=`, payload);
    if (!payload || Object.keys(payload).length === 0) return res.status(400).json({ status: "error", message: "Body tidak boleh kosong" });

    // Tidak ada validasi khusus selain user_default

    const newItem = await dataStore.create(module, payload);
    res.status(201).json({ status: "success", module, message: "Item berhasil dibuat", data: newItem });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/dynamic/*/:id", async (req, res) => {
  try {
    const raw = req.params[0] || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) return res.status(400).json({ status: "error", message: "Body tidak boleh kosong" });

    // Tidak ada validasi khusus selain user_default

    const updated = await dataStore.update(module, id, payload);
    if (!updated) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    res.json({ status: "success", module, message: "Item berhasil diperbarui", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/dynamic/*/:id", async (req, res) => {
  try {
    const raw = req.params[0] || "";
    const module = normalizeModuleFromPath(raw);
    const id = req.params.id;
    const deleted = await dataStore.delete(module, id);
    if (!deleted) return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    res.json({ status: "success", module, message: "Item berhasil dihapus", data: deleted });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// List semua items dari satu module
router.get("/:module", async (req, res) => {
  try {
    const { module } = req.params;
    const items = await dataStore.getAll(module);

    // Extract pagination params from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Paginate if needed
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    res.json({
      status: "success",
      module,
      total: items.length,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get satu item by ID
router.get("/:module/:id", async (req, res) => {
  try {
    const { module, id } = req.params;
    const item = await dataStore.getById(module, id);

    if (!item) {
      return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    }

    res.json({ status: "success", module, data: item });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Create item baru
router.post("/:module", async (req, res) => {
  try {
    const { module } = req.params;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ status: "error", message: "Body tidak boleh kosong" });
    }

    // Tidak ada validasi khusus selain user_default

    const newItem = await dataStore.create(module, payload);
    res.status(201).json({
      status: "success",
      module,
      message: "Item berhasil dibuat",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Update item
router.put("/:module/:id", async (req, res) => {
  try {
    const { module, id } = req.params;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ status: "error", message: "Body tidak boleh kosong" });
    }

    // Tidak ada validasi khusus selain user_default

    const updated = await dataStore.update(module, id, payload);

    if (!updated) {
      return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    }

    res.json({
      status: "success",
      module,
      message: "Item berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Delete item
router.delete("/:module/:id", async (req, res) => {
  try {
    const { module, id } = req.params;
    const deleted = await dataStore.delete(module, id);

    if (!deleted) {
      return res.status(404).json({ status: "error", message: `Item dengan ID ${id} tidak ditemukan` });
    }

    res.json({
      status: "success",
      module,
      message: "Item berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Routes for pengurus, berita, and galery using dataStore
router.get("/pengurus", async (req, res) => {
  try {
    const items = await dataStore.getAll("pengurus");
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/berita", async (req, res) => {
  try {
    const items = await dataStore.getAll("berita");
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/galery", async (req, res) => {
  try {
    const items = await dataStore.getAll("galery");
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
