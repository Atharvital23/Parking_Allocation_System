import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('Parking_ByANI');
    const collection = db.collection('User_Data');

    // Check if user already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Insert new user
    await collection.insertOne({ username: name, email, password, role: 'user' });

    return res.status(201).json({ username: name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
