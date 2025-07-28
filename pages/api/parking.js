import clientPromise from '../../lib/mongodb';

// API route to record parking details
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return all parking details
    const client = await clientPromise;
    const db = client.db('Parking_ByANI');
    const records = await db.collection('Parking_Details').find({}).toArray();
    return res.status(200).json(records);
  }
  // Handle payment updates
  if (req.method === 'PATCH') {
    const { ticketNo, checkout, spotId, active } = req.body;
    const client = await clientPromise;
    const db = client.db('Parking_ByANI');
    try {
      if (checkout) {
        // Move parking record to Check_Out collection before removing
        const parkingCol = db.collection('Parking_Details');
        const checkOutCol = db.collection('Check_Out');
        const record = await parkingCol.findOne({ ticketNo });
        if (!record) {
          return res.status(404).json({ message: 'Ticket not found' });
        }
        // Add checkout time
        record.checkedOutAt = new Date();
        await checkOutCol.insertOne(record);
        const result = await parkingCol.deleteOne({ ticketNo });
        if (result.deletedCount === 1) {
          return res.status(200).json({ message: 'Checked out and moved to Check_Out' });
        }
        return res.status(500).json({ message: 'Failed to delete from Parking_Details after moving' });
      }
      if (typeof active === 'boolean' && spotId) {
        // Toggle active status for a spot
        const result = await db.collection('Parking_Details').updateOne(
          { spotId },
          { $set: { active } }
        );
        if (result.modifiedCount === 1) {
          return res.status(200).json({ message: 'Active status updated' });
        }
        return res.status(404).json({ message: 'Spot not found' });
      }
      // Otherwise handle payment
      if (ticketNo) {
        const result = await db.collection('Parking_Details').updateOne(
          { ticketNo },
          { $set: { paid: true } }
        );
        if (result.modifiedCount === 1) {
          return res.status(200).json({ message: 'Payment recorded' });
        }
        return res.status(404).json({ message: 'Ticket not found' });
      }
      return res.status(400).json({ message: 'Invalid PATCH request' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end();
  }

  const { ticketNo, spotId, name, vehicle, type } = req.body;
  if (!ticketNo || !spotId || !name || !vehicle || !type) {
    return res.status(400).json({ message: 'Missing required parking details' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('Parking_ByANI');
    const collection = db.collection('Parking_Details');

    const createdAt = new Date();
    const expireAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const price = type === '2W' ? 250 : 425;

    await collection.insertOne({
      ticketNo,
      spotId,
      name,
      vehicle,
      type,
      price,
      createdAt,
      expireAt,
      paid: false,
      active: true,
      // pdf is generated on client side; PDF storage not implemented
    });

    return res.status(201).json({ message: 'Parking details recorded' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
