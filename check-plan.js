const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const plans = await mongoose.connection.collection('plans').find({ name: /enterprise/i }).toArray();
  console.log(JSON.stringify(plans, null, 2));
  process.exit();
});
