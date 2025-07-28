import clientPromise from '../../lib/mongodb';

// POST: Initiate payment (store intent), PATCH: update payment status
export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('Parking_ByANI');
  // Ensure Payments collection exists
  const collections = await db.listCollections({ name: 'Payments' }).toArray();
  if (collections.length === 0) {
    await db.createCollection('Payments');
  }
  const collection = db.collection('Payments');

  if (req.method === 'POST') {
    // Create a new payment intent (before Razorpay checkout)
    const { ticketNo, name } = req.body;
    if (!ticketNo || !name) {
      return res.status(400).json({ message: 'Missing ticketNo or name' });
    }
    const createdAt = new Date();
    const payment = {
      ticketNo,
      name,
      transactionId: null,
      paid: false,
      createdAt,
      updatedAt: createdAt,
    };
    await collection.insertOne(payment);
    return res.status(201).json({ message: 'Payment intent created', payment });
  }

  if (req.method === 'PATCH') {
    // Update payment after Razorpay callback
    const { ticketNo, transactionId, paid, ticketData } = req.body;
    if (!ticketNo || !transactionId || typeof paid !== 'boolean') {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const updatedAt = new Date();
    const result = await collection.updateOne(
      { ticketNo },
      { $set: { transactionId, paid, updatedAt } }
    );
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Payment updated' });
    }
    return res.status(404).json({ message: 'Payment not found' });
  }

  res.setHeader('Allow', ['POST', 'PATCH']);
  res.status(405).end();
}
