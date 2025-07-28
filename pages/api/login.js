import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { role, email, username, password } = req.body;
  const client = await clientPromise;
  const db = client.db("Parking_ByANI");
  // Auto-seed Workers_Data if empty (admin and workers)
  const workersCollection = db.collection("Workers_Data");
  const workersCount = await workersCollection.countDocuments();
  if (workersCount === 0) {
    await workersCollection.insertMany([
      { username: "admin",   password: "admin123",  role: "admin"  },
      { username: "worker1", password: "worker123", role: "worker" },
      { username: "worker2", password: "worker456", role: "worker" }
    ]);
  }

  try {
    if (role === 'user') {
      const user = await db.collection('User_Data').findOne({ email, password });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ username: user.username, role: 'user' });
    } else {
      const worker = await db.collection('Workers_Data').findOne({ username, password });
      if (!worker) return res.status(401).json({ message: 'Invalid credentials' });
      return res.status(200).json({ username: worker.username, role: worker.role });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Initial seeding of the Workers_Data collection
async function seedWorkersData() {
  const client = await clientPromise;
  const db = client.db("Parking_ByANI");
  
  const workers = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "worker1", password: "worker123", role: "worker" },
    { username: "worker2", password: "worker456", role: "worker" }
  ];
  
  await db.collection('Workers_Data').insertMany(workers);
}

// Uncomment the line below to seed the database
// seedWorkersData();
