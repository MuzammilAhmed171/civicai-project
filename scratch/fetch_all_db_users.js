const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'd:/Hacathon competition/Backup/Final Mubashir Ahmed/civicai-project/.env' });

let MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicai';

const userSchema = new mongoose.Schema({
  name: String,
  cnic: String,
  email: String,
  phone: String,
  city: String,
  role: String
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  citizenName: String,
  cnic: String,
  category: String,
  description: String,
  status: String,
  assignedDepartment: String,
  resolutionNotes: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

async function checkMongoDBAtlasContents() {
  console.log('Connecting to MongoDB Atlas Cluster:', MONGO_URI.split('@')[1] || MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ CONNECTED TO LIVE MONGODB ATLAS DATABASE!\n');

  const users = await User.find().sort({ createdAt: -1 });
  console.log(`📋 TOTAL USERS FOUND IN MONGODB ATLAS USER COLLECTION: ${users.length}`);
  users.forEach((u, i) => {
    console.log(` [${i+1}] ID: ${u._id} | Name: "${u.name}" | CNIC: ${u.cnic} | Email: ${u.email} | City: ${u.city} | Created: ${u.createdAt}`);
  });

  const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(10);
  console.log(`\n📋 RECENT COMPLAINTS IN MONGODB ATLAS COMPLAINT COLLECTION: ${complaints.length}`);
  complaints.forEach((c, i) => {
    console.log(` [${i+1}] ID: ${c._id} | Citizen: "${c.citizenName}" (${c.cnic}) | Cat: ${c.category} | Status: ${c.status} | Dept: ${c.assignedDepartment}`);
  });

  await mongoose.disconnect();
}

checkMongoDBAtlasContents().catch(console.error);
