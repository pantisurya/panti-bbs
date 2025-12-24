import { MongoClient, ObjectId } from 'mongodb';

// URL Koneksi MongoDB Atlas Anda
const uri = "mongodb+srv://pantisurya:yps311074@panti-surya-db.uysvgeg.mongodb.net/?appName=panti-surya-db";
const client = new MongoClient(uri);

export const dataStore = {
  // Fungsi internal untuk koneksi ke koleksi MongoDB
  async getCol(module) {
    try {
      await client.connect();
      // Database akan dinamai 'panti_bbs'
      return client.db('panti_bbs').collection(module);
    } catch (error) {
      console.error("MongoDB Connection Error:", error);
      throw error;
    }
  },

  // Mengambil semua data dari koleksi
  async getAll(module) {
    const col = await this.getCol(module);
    const items = await col.find({}).toArray();
    // Mengubah format _id bawaan MongoDB menjadi id agar cocok dengan Frontend
    return items.map(item => ({ ...item, id: item._id.toString() }));
  },

  // Mengambil satu data berdasarkan ID
  async getById(module, id) {
    try {
      const col = await this.getCol(module);
      const item = await col.findOne({ _id: new ObjectId(id) });
      return item ? { ...item, id: item._id.toString() } : null;
    } catch (e) {
      return null;
    }
  },

  // Menambah data baru
  async create(module, data) {
    const col = await this.getCol(module);
    const result = await col.insertOne({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { ...data, id: result.insertedId.toString() };
  },

  // Mengubah data yang sudah ada
  async update(module, id, data) {
    try {
      const col = await this.getCol(module);
      const { id: _, ...updateData } = data; // Menghapus field id agar tidak ikut ter-update
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } }
      );
      return { id, ...updateData };
    } catch (e) {
      return null;
    }
  },

  // Menghapus data
  async delete(module, id) {
    try {
      const col = await this.getCol(module);
      return await col.deleteOne({ _id: new ObjectId(id) });
    } catch (e) {
      return null;
    }
  }
};