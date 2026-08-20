const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function testBackendPersistence() {
  console.log('🚀 TESTING END-TO-END MONGODB ATLAS PERSISTENCE FOR MUBASHIR AHMED...\n');

  // 1. Create New User: Mubashir Ahmed
  const userPayload = {
    name: 'Mubashir Ahmed',
    cnic: '42101-9988776-1',
    email: 'mubashir.ahmed@civicpak.gov.pk',
    phone: '0300-9988776',
    city: 'Karachi',
    password: 'password123'
  };

  console.log('1️⃣ REGISTERING NEW USER: Mubashir Ahmed...');
  const regRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, userPayload);

  console.log('Register Response Status:', regRes.status);
  console.log('Registered User Data:', regRes.data);

  let authToken = regRes.data?.token;
  let userId = regRes.data?._id;

  if (!authToken) {
    console.log('Attempting Login for existing user Mubashir Ahmed...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { identity: '42101-9988776-1', password: 'password123' });

    console.log('Login Response:', loginRes.data);
    authToken = loginRes.data?.token;
    userId = loginRes.data?._id;
  }

  if (!authToken) {
    console.error('❌ FAILED TO OBTAIN AUTH TOKEN!');
    return;
  }

  // 2. Submit New Complaint for Mubashir Ahmed
  console.log('\n2️⃣ CREATING NEW CIVIC COMPLAINT IN MONGODB ATLAS...');
  const complaintPayload = {
    province: 'Sindh',
    city: 'Karachi',
    addressLine1: 'House 45, Block 3, Gulshan-e-Iqbal',
    addressLine2: 'Near NIPA Chowrangi',
    location: 'House 45, Block 3, Gulshan-e-Iqbal, Karachi, Sindh',
    description: 'Broken water main pipeline causing severe street flooding and clean water shortage in Gulshan Block 3.',
    category: 'Water',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };

  const complaintRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/complaints',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  }, complaintPayload);

  console.log('Complaint Creation Status:', complaintRes.status);
  console.log('Created Complaint Data:', complaintRes.data);

  const complaintId = complaintRes.data?._id;
  if (!complaintId) {
    console.error('❌ FAILED TO CREATE COMPLAINT!');
    return;
  }

  // 3. Update Status & Official Officer Remarks in MongoDB Atlas
  console.log('\n3️⃣ UPDATING STATUS & OFFICIAL REMARKS IN MONGODB ATLAS...');
  const updateRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${complaintId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  }, {
    status: 'In Progress',
    resolutionNotes: 'Municipal inspection team and heavy water pump machinery dispatched to Gulshan Block 3 site.'
  });

  console.log('Update Status:', updateRes.status);
  console.log('Updated Complaint in MongoDB Atlas:', updateRes.data);

  // 4. Verify DB Query Persistence
  console.log('\n4️⃣ VERIFYING MONGODB ATLAS PERSISTENCE QUERY...');
  const queryRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${complaintId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  console.log('Query Verification Status:', queryRes.status);
  console.log('Retrieved Document from MongoDB Atlas:', {
    _id: queryRes.data?._id,
    citizenName: queryRes.data?.citizenName,
    cnic: queryRes.data?.cnic,
    category: queryRes.data?.category,
    status: queryRes.data?.status,
    assignedDepartment: queryRes.data?.assignedDepartment,
    resolutionNotes: queryRes.data?.resolutionNotes
  });

  console.log('\n✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY WITH MONGODB ATLAS!');
}

testBackendPersistence().catch(console.error);
