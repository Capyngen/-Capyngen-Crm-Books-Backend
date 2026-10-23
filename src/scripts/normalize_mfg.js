const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/backend/.env' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Normalize routings
  const routings = await db.collection('routings').find({}).toArray();
  for (const r of routings) {
    await db.collection('routings').updateOne(
      { _id: r._id },
      {
        $set: {
          name: r.name || r.routingName || 'OBD SMT Pick-and-Place & Ultrasonic Welding Sequence',
          code: r.code || r.routingCode || 'RTG-SMT-01',
          routingName: r.routingName || r.name || 'OBD SMT Pick-and-Place & Ultrasonic Welding Sequence',
          routingCode: r.routingCode || r.code || 'RTG-SMT-01',
          standardLotSize: r.standardLotSize || 100,
          operations: r.operations && r.operations.length > 0 ? r.operations : (r.stages || []).map((s, i) => ({
            stepNumber: s.step || i + 1,
            name: s.operation || `Step ${i + 1}`,
            expectedTimeMinutes: Math.round((s.standardHours || 0.25) * 60),
            setupTimeMinutes: 10,
            hourlyRate: 45
          }))
        }
      }
    );
  }
  console.log('✅ Normalized routings count:', routings.length);

  // Normalize machines
  const machines = await db.collection('machines').find({}).toArray();
  for (const m of machines) {
    await db.collection('machines').updateOne(
      { _id: m._id },
      {
        $set: {
          name: m.name || m.machineName || 'High-Speed SMT Surface Mount Feeder',
          code: m.code || m.machineCode || 'MCH-SMT-01',
          machineName: m.machineName || m.name || 'High-Speed SMT Surface Mount Feeder',
          machineCode: m.machineCode || m.code || 'MCH-SMT-01',
          hourlyRate: m.hourlyRate || 85,
          workCenter: m.workCenter || 'Surface Mount Tech Bay 1',
          status: m.status || 'Running'
        }
      }
    );
  }
  console.log('✅ Normalized machines count:', machines.length);

  await mongoose.disconnect();
}

main().catch(console.error);
