const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Complaint = require('../models/Complaint');

const seedDatabase = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI || 'mongodb+srv://civic:civic123@cluster0.9ngdzyh.mongodb.net/civicai?retryWrites=true&w=majority';
    if (!mongoURI.includes('civicai')) {
      mongoURI = mongoURI.replace(/\.net\/?.*$/, '.net/civicai?retryWrites=true&w=majority');
    }
    console.log('Connecting to MongoDB Atlas database [civicai] at:', mongoURI);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // Password hash for all seeded users
    const defaultPasswordHash = await bcrypt.hash('citizen123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // 1. Users list (25 Citizens + 1 Admin)
    const userSeeds = [
      {
        name: "Chief Municipal Inspector",
        cnic: "00000-0000000-0",
        email: "admin@civicai.gov",
        phone: "+92-300-0000000",
        city: "Islamabad Capital Territory",
        password: adminPasswordHash,
        role: "admin"
      },
      {
        name: "Mubashir Ahmed",
        cnic: "41302-6440108-1",
        email: "mughalmubashir098@gmail.com",
        phone: "03112878030",
        city: "Karachi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Tariq Mahmood",
        cnic: "41302-4468585-8",
        email: "tariq@gmail.com",
        phone: "03356566865",
        city: "Karachi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Ahmed Raza",
        cnic: "41302-4466786-5",
        email: "ahmed@gmail.com",
        phone: "03332751357",
        city: "Karachi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Usman Khan",
        cnic: "35202-1234567-1",
        email: "usman.khan@gmail.com",
        phone: "03001234567",
        city: "Lahore",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Fatima Ali",
        cnic: "61101-2345678-2",
        email: "fatima.ali@gmail.com",
        phone: "03122345678",
        city: "Islamabad",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Bilal Hussain",
        cnic: "37405-3456789-3",
        email: "bilal.h@gmail.com",
        phone: "03213456789",
        city: "Rawalpindi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Zainab Bibi",
        cnic: "17301-4567890-4",
        email: "zainab.b@gmail.com",
        phone: "03344567890",
        city: "Peshawar",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Hamza Baloch",
        cnic: "54400-5678901-5",
        email: "hamza.baloch@gmail.com",
        phone: "03455678901",
        city: "Quetta",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Sana Shah",
        cnic: "36302-6789012-6",
        email: "sana.shah@gmail.com",
        phone: "03016789012",
        city: "Multan",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Kamran Siddiqui",
        cnic: "33100-7890123-7",
        email: "kamran.s@gmail.com",
        phone: "03137890123",
        city: "Faisalabad",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Zubair Ahmed",
        cnic: "41302-8901234-8",
        email: "zubair.hyd@gmail.com",
        phone: "03228901234",
        city: "Hyderabad",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Nida Parveen",
        cnic: "41303-9012345-9",
        email: "nida.hyd@gmail.com",
        phone: "03319012345",
        city: "Hyderabad",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Imran Qureshi",
        cnic: "42101-0123456-0",
        email: "imran.khi@gmail.com",
        phone: "03020123456",
        city: "Karachi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Ayesha Malik",
        cnic: "35201-1234568-1",
        email: "ayesha.lhr@gmail.com",
        phone: "03141234568",
        city: "Lahore",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Danish Rehman",
        cnic: "34202-2345679-2",
        email: "danish.skt@gmail.com",
        phone: "03252345679",
        city: "Sialkot",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Mariam Sohail",
        cnic: "34501-3456780-3",
        email: "mariam.gjw@gmail.com",
        phone: "03363456780",
        city: "Gujranwala",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Asadullah Bhutto",
        cnic: "45502-4567891-4",
        email: "asad.suk@gmail.com",
        phone: "03474567891",
        city: "Sukkur",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Shahid Memon",
        cnic: "43203-5678902-5",
        email: "shahid.lrk@gmail.com",
        phone: "03035678902",
        city: "Larkana",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Rizwan Khattak",
        cnic: "14301-6789013-6",
        email: "rizwan.pesh@gmail.com",
        phone: "03156789013",
        city: "Peshawar",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Hassan Gillani",
        cnic: "82201-7890124-7",
        email: "hassan.ajk@gmail.com",
        phone: "03267890124",
        city: "Muzaffarabad",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Sajid Hunzai",
        cnic: "71501-8901235-8",
        email: "sajid.gb@gmail.com",
        phone: "03378901235",
        city: "Gilgit",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Rashid Minhas",
        cnic: "42201-9012346-9",
        email: "rashid.khi@gmail.com",
        phone: "03049012346",
        city: "Karachi",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Mehwish Tariq",
        cnic: "35203-0123457-0",
        email: "mehwish.lhr@gmail.com",
        phone: "03160123457",
        city: "Lahore",
        password: defaultPasswordHash,
        role: "citizen"
      },
      {
        name: "Waqas Chaudhry",
        cnic: "33101-1234578-1",
        email: "waqas.fsd@gmail.com",
        phone: "03271234578",
        city: "Faisalabad",
        password: defaultPasswordHash,
        role: "citizen"
      }
    ];

    console.log('Seeding Users collection...');
    await User.deleteMany({});
    const createdUsers = await User.insertMany(userSeeds);
    console.log(`✅ Seeded ${createdUsers.length} Users successfully.`);

    // Map user lookup
    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.email] = u;
    });

    // 2. Build 110 Complaint Seeds
    const citiesAndProvinces = [
      { city: 'Karachi', province: 'Sindh' },
      { city: 'Hyderabad', province: 'Sindh' },
      { city: 'Sukkur', province: 'Sindh' },
      { city: 'Larkana', province: 'Sindh' },
      { city: 'Lahore', province: 'Punjab' },
      { city: 'Rawalpindi', province: 'Punjab' },
      { city: 'Faisalabad', province: 'Punjab' },
      { city: 'Multan', province: 'Punjab' },
      { city: 'Sialkot', province: 'Punjab' },
      { city: 'Gujranwala', province: 'Punjab' },
      { city: 'Islamabad', province: 'Islamabad Capital Territory' },
      { city: 'Peshawar', province: 'Khyber Pakhtunkhwa' },
      { city: 'Quetta', province: 'Balochistan' },
      { city: 'Muzaffarabad', province: 'Azad Jammu & Kashmir' },
      { city: 'Gilgit', province: 'Gilgit-Baltistan' }
    ];

    const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];

    const departments = {
      Road: 'PWD Road Infrastructure Dept',
      Water: 'WASMO & Water Board',
      Waste: 'Solid Waste Management Authority',
      Electricity: 'K-Electric / WAPDA Division',
      Drainage: 'Sewerage & Drainage Wing',
      Safety: 'Traffic & Municipal Police Division',
      Other: 'General Municipal Administration'
    };

    // Template descriptions for authentic civic complaints
    const complaintTemplates = [
      { cat: 'Road', desc: 'Major pothole hazard on main boulevard causing severe traffic delays and vehicle damage.', pri: 'High' },
      { cat: 'Road', desc: 'Main artery road submerged under standing rainwater due to damaged asphalt layers.', pri: 'Critical' },
      { cat: 'Road', desc: 'Damaged street pavement and broken kerb blocks near public school entrance.', pri: 'Medium' },
      { cat: 'Road', desc: 'Deep excavation trench left open by contractors without warning lights or barricades.', pri: 'Critical' },
      { cat: 'Water', desc: 'No drinking water supply in residential sector for past 4 consecutive days.', pri: 'High' },
      { cat: 'Water', desc: 'Severe main pipeline leak causing fresh water wastage into street drains.', pri: 'Medium' },
      { cat: 'Water', desc: 'Contaminated muddy water flowing through municipal household taps.', pri: 'Critical' },
      { cat: 'Waste', desc: 'Overflowing garbage dumpster dumping waste onto pedestrian walkway.', pri: 'High' },
      { cat: 'Waste', desc: 'Unattended commercial waste pile attracting pests near market square.', pri: 'Medium' },
      { cat: 'Waste', desc: 'Illegal dumping of solid debris along river bank area.', pri: 'Low' },
      { cat: 'Electricity', desc: 'High voltage transformer sparking dangerously near residential balconies.', pri: 'Critical' },
      { cat: 'Electricity', desc: 'Broken street lights leaving entire commercial alley in complete darkness.', pri: 'Medium' },
      { cat: 'Electricity', desc: 'Dangling live electric cables lying exposed across wet pedestrian path.', pri: 'Critical' },
      { cat: 'Drainage', desc: 'Clogged main sewer line causing sewage backflow into ground floor homes.', pri: 'Critical' },
      { cat: 'Drainage', desc: 'Missing manhole cover on busy street posing fatal fall risk for pedestrians.', pri: 'Critical' },
      { cat: 'Drainage', desc: 'Storm drain overflow flooding local market area during heavy downpour.', pri: 'High' },
      { cat: 'Safety', desc: 'Broken pedestrian overhead bridge stairs with unstable guard railings.', pri: 'High' },
      { cat: 'Safety', desc: 'Unregulated hazardous chemical store operating without fire safety equipment.', pri: 'Critical' },
      { cat: 'Safety', desc: 'Malfunctioning traffic signals at major four-way junction causing frequent near-accidents.', pri: 'High' },
      { cat: 'Other', desc: 'Encroachment by vendor stalls blocking public hospital emergency exit path.', pri: 'High' }
    ];

    // Specific Duplicate Bundles (10 Clusters)
    const duplicateClusters = [
      {
        groupId: 'DUP_ROAD_KAR_01',
        city: 'Karachi',
        province: 'Sindh',
        category: 'Road',
        priority: 'Critical',
        address1: 'Main Super Highway (Karachi to Hyderabad)',
        location: 'Main Super Highway, Toll Plaza, Karachi, Sindh',
        items: [
          'Main supper highway per pani bhara hua he jis wajah se highway per traffic full jam he',
          'Heavy flooding on main super highway near toll plaza, vehicles stuck for hours',
          'Super highway road flooded with rainwater, traffic completely immobilized'
        ]
      },
      {
        groupId: 'DUP_ROAD_HYD_01',
        city: 'Hyderabad',
        province: 'Sindh',
        category: 'Road',
        priority: 'Medium',
        address1: 'Guru Nagar, Teen Number Talaq',
        location: 'Guru Nagar, Teen Number Talaq, Hyderabad, Sindh',
        items: [
          'Road per Pani Bhar Gaya men road per',
          'Men road per Pani Bhar Gaya, commuters unable to pass',
          'Guru nagar main road flooded with sewage water'
        ]
      },
      {
        groupId: 'DUP_WATER_HYD_01',
        city: 'Hyderabad',
        province: 'Sindh',
        category: 'Water',
        priority: 'High',
        address1: 'Affandi Town Sector B',
        location: 'Affandi Town, Sector B, Hyderabad, Sindh',
        items: [
          'There has been no drinking water here for three or four days.',
          'Severe water crisis in Affandi town, no pipeline water since Sunday',
          'Affandi town residents suffering from complete water supply shutdown'
        ]
      },
      {
        groupId: 'DUP_WASTE_LHR_01',
        city: 'Lahore',
        province: 'Punjab',
        category: 'Waste',
        priority: 'High',
        address1: 'Gulberg III Main Market Block B',
        location: 'Gulberg III, Main Market, Lahore, Punjab',
        items: [
          'Massive garbage accumulation behind main market Gulberg III, foul odor spreading',
          'Overflowing waste dumpers blocking parking behind Gulberg III shops',
          'Solid waste management has not collected trash from Gulberg main market for 5 days'
        ]
      },
      {
        groupId: 'DUP_ELEC_ISL_01',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        category: 'Electricity',
        priority: 'Critical',
        address1: 'Sector F-7/2 College Road',
        location: 'Sector F-7/2, College Road, Islamabad',
        items: [
          'Transformer smoking and sparking violently near F-7/2 commercial area',
          'Dangerous electrical sparks from main transformer at College Road F-7/2'
        ]
      },
      {
        groupId: 'DUP_DRAIN_RWP_01',
        city: 'Rawalpindi',
        province: 'Punjab',
        category: 'Drainage',
        priority: 'Critical',
        address1: 'Nullah Lai Road near Raja Bazaar',
        location: 'Raja Bazaar, Nullah Lai Road, Rawalpindi, Punjab',
        items: [
          'Main sewage drain overflowing into Raja Bazaar shops',
          'Nullah Lai water backing up onto main shopping street in Raja Bazaar'
        ]
      },
      {
        groupId: 'DUP_ROAD_PESH_01',
        city: 'Peshawar',
        province: 'Khyber Pakhtunkhwa',
        category: 'Road',
        priority: 'High',
        address1: 'University Road near Saddar',
        location: 'University Road, Saddar, Peshawar, KPK',
        items: [
          'Deep open trench excavated across University Road left unpaved',
          'University Road Peshawar dangerous road cut causing major accidents'
        ]
      },
      {
        groupId: 'DUP_WATER_QUET_01',
        city: 'Quetta',
        province: 'Balochistan',
        category: 'Water',
        priority: 'High',
        address1: 'Jinnah Road Block A',
        location: 'Jinnah Road, Block A, Quetta, Balochistan',
        items: [
          'Contaminated yellow water coming out of municipal taps on Jinnah Road',
          'Dirty sewage water mixing in drinking water pipe near Jinnah Road Quetta'
        ]
      },
      {
        groupId: 'DUP_WASTE_MULT_01',
        city: 'Multan',
        province: 'Punjab',
        category: 'Waste',
        priority: 'Medium',
        address1: 'Bosan Road near BZU Gate',
        location: 'Bosan Road, BZU Campus Area, Multan, Punjab',
        items: [
          'Uncollected garbage heaps along Bosan Road near university gate',
          'Trash dumped along roadside Bosan Road causing severe hygiene issue'
        ]
      },
      {
        groupId: 'DUP_ROAD_FSD_01',
        city: 'Faisalabad',
        province: 'Punjab',
        category: 'Road',
        priority: 'Medium',
        address1: 'Canal Road Crossing Clock Tower',
        location: 'Canal Road, Clock Tower Area, Faisalabad, Punjab',
        items: [
          'Broken manhole covers and damaged carpet road along Canal Road',
          'Hazardous open hole on Canal Road Faisalabad near clock tower crossing'
        ]
      }
    ];

    const complaintSeeds = [];
    const citizenUsersList = createdUsers.filter(u => u.role === 'citizen');

    let complaintIndex = 1;

    // 1. Seed Duplicate Clusters (approx 26 complaints)
    duplicateClusters.forEach((cluster) => {
      cluster.items.forEach((desc, idx) => {
        const u = citizenUsersList[complaintIndex % citizenUsersList.length];
        const status = idx === 0 ? 'Assigned' : 'Open';

        complaintSeeds.push({
          user: u._id,
          citizenName: u.name,
          cnic: u.cnic,
          phone: u.phone,
          province: cluster.province,
          city: cluster.city,
          addressLine1: cluster.address1,
          addressLine2: `Sector ${idx + 1}`,
          description: desc,
          category: cluster.category,
          priority: cluster.priority,
          location: cluster.location,
          imageUrl: '',
          status: status,
          assignedDepartment: departments[cluster.category],
          resolutionNotes: idx === 0 ? 'Logged into municipal dispatch system.' : 'Automated System Alert: Flagged as potential duplicate report for this location.',
          isDuplicate: true,
          duplicateGroupId: cluster.groupId,
          aiOutput: {
            category: cluster.category,
            priority: cluster.priority,
            confidence: 0.92,
            visualSummary: 'Text & Visual Analysis: High urgency civic report confirmed.'
          },
          createdAt: new Date(Date.now() - (complaintIndex % 18) * 3600 * 1000)
        });
        complaintIndex++;
      });
    });

    // 2. Seed remaining individual complaints to reach 110+ complaints
    while (complaintSeeds.length < 112) {
      const template = complaintTemplates[complaintSeeds.length % complaintTemplates.length];
      const locationObj = citiesAndProvinces[complaintSeeds.length % citiesAndProvinces.length];
      const u = citizenUsersList[complaintSeeds.length % citizenUsersList.length];
      const status = statuses[complaintSeeds.length % statuses.length];
      const hoursAgo = (complaintSeeds.length % 2 === 0) ? (complaintSeeds.length % 22) : (complaintSeeds.length * 3);

      complaintSeeds.push({
        user: u._id,
        citizenName: u.name,
        cnic: u.cnic,
        phone: u.phone,
        province: locationObj.province,
        city: locationObj.city,
        addressLine1: `Block ${ (complaintSeeds.length % 9) + 1 } Street ${(complaintSeeds.length % 15) + 1}`,
        addressLine2: `Main Area ${locationObj.city}`,
        description: `${template.desc} (Grievance Ref: #${complaintSeeds.length + 101})`,
        category: template.cat,
        priority: template.pri,
        location: `Block ${(complaintSeeds.length % 9) + 1}, ${locationObj.city}, ${locationObj.province}`,
        imageUrl: '',
        status: status,
        assignedDepartment: departments[template.cat],
        resolutionNotes: status === 'Resolved' || status === 'Closed' ? 'Issue inspected and resolved by municipal field team.' : 'Under review by municipal department.',
        isDuplicate: false,
        duplicateGroupId: '',
        aiOutput: {
          category: template.cat,
          priority: template.pri,
          confidence: 0.88 + ((complaintSeeds.length % 10) / 100),
          visualSummary: `Official Municipal Record: Categorized as ${template.cat} under ${locationObj.city} division.`
        },
        createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000)
      });
    }

    console.log('Seeding Complaints collection...');
    await Complaint.deleteMany({});
    const createdComplaints = await Complaint.insertMany(complaintSeeds);
    console.log(`✅ Seeded ${createdComplaints.length} Complaints successfully.`);

    console.log('\n=============================================');
    console.log('🎉 MONGODB ATLAS SEEDING COMPLETE!');
    console.log(`- Total Users in DB: ${createdUsers.length}`);
    console.log(`- Total Complaints in DB: ${createdComplaints.length}`);
    console.log(`- Total Duplicate Groups: ${duplicateClusters.length}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
