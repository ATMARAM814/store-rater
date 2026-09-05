const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

async function seedData() {
  console.log('🌱 Starting Indian Mock Data Seeding...');

  const passwordHash = await bcrypt.hash('Test@1234', 12);

  // 1. Store Owners & Stores (Diverse Non-Generic Indian Businesses)
  const storeData = [
    {
      owner: {
        name: 'Rameshchandra Babulal Patel',
        email: 'patel.ramesh@mithaibhandar.in',
        address: 'B-401, Shivalik High Street, Judges Bungalow Road, Bodakdev, Ahmedabad, Gujarat 380054',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Patel Mithai & Farsan Mart',
        email: 'contact@patelmithai.in',
        address: 'Shop 14, Opposite Manek Chowk, Old City Market, Ahmedabad, Gujarat 380001 (GSTIN: 24AAAFP1234F1Z1)',
      },
    },
    {
      owner: {
        name: 'Venkataraman Subramaniam',
        email: 'v.subramaniam@tnegadgets.in',
        address: '22/4, Murugappa Street, R.A. Puram, Mandaveli, Chennai, Tamil Nadu 600028',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Sri Ganesh Electronics & Mobiles',
        email: 'sales@sriganeshelectronics.in',
        address: 'Plot 45, Usman Road, T. Nagar Commercial Complex, Chennai, Tamil Nadu 600017 (GSTIN: 33AAAFS5678A1Z2)',
      },
    },
    {
      owner: {
        name: 'Sundararajan Murugesan',
        email: 'sundar.murugesan@silkemporium.in',
        address: 'Apartment 5A, Prestige Palms, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Nalli Silks & Traditional Sarees',
        email: 'orders@nallisilks.in',
        address: 'No. 88, 100 Feet Road, 4th Block, Indiranagar, Bengaluru, Karnataka 560038 (GSTIN: 29AABFN9012B1Z3)',
      },
    },
    {
      owner: {
        name: 'Anandapadmanabhan Namboodiri',
        email: 'anand.namboodiri@ayurcare.in',
        address: 'Tharavadu Illam, Swaraj Round South, Kuruppam Road, Thrissur, Kerala 680001',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Sanjeevani Ayurvedic & Wellness Pharmacy',
        email: 'care@sanjeevaniayur.in',
        address: 'Building 3, Palace Road, Chembukavu Central, Thrissur, Kerala 680020 (GSTIN: 32AACCS3456C1Z4)',
      },
    },
    {
      owner: {
        name: 'Debashish Mukhopadhyay',
        email: 'debashish.m@kitabghar.org',
        address: 'Flat 3B, Sarat Bose Road, Triangular Park, Ballygunge, Kolkata, West Bengal 700029',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Kitab Khana Books & Stationery Depot',
        email: 'info@kitabkhanabooks.in',
        address: '12/A, College Street Boi Para, Near Presidency College, Kolkata, West Bengal 700073 (GSTIN: 19AAAFK7890D1Z5)',
      },
    },
    {
      owner: {
        name: 'Chhaganlal Kanhaiyalal Mittal',
        email: 'chhaganlal.mittal@jewels.in',
        address: 'Bunglow 9, Civil Lines, Near Raj Bhavan, Jaipur, Rajasthan 302006',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Mittal & Sons Heritage Jewellers',
        email: 'concierge@mittaljewellers.in',
        address: 'Showroom 22, Johari Bazar, Heritage Pink City, Jaipur, Rajasthan 302003 (GSTIN: 08AAAFM1122E1Z6)',
      },
    },
    {
      owner: {
        name: 'Rajeshwar Narayanrao Deshmukh',
        email: 'rajeshwar.deshmukh@udupicafe.in',
        address: 'Rowhouse 4, Kothrud Vanaz Corner, Paud Road, Pune, Maharashtra 411038',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Arya Bhavan Pure Ghee Cafe & Tiffin',
        email: 'dine@aryabhavancafe.in',
        address: 'Shop 5, FC Road Deccan Gymkhana, Shivaji Nagar, Pune, Maharashtra 411004 (GSTIN: 27AABFD3344F1Z7)',
      },
    },
    {
      owner: {
        name: 'Gurvinderpal Balwant Singh',
        email: 'gurvinder.singh@hardwaredepot.in',
        address: 'D-88, Kirti Nagar Industrial Area, West Delhi, New Delhi 110015',
        role: 'STORE_OWNER',
      },
      store: {
        name: 'Bajrang Hardware & Asian Paints Depot',
        email: 'supply@bajranghardware.in',
        address: 'Shop 18, Chawri Bazar Commercial Hub, Old Delhi, New Delhi 110006 (GSTIN: 07AAAFB5566G1Z8)',
      },
    },
  ];

  // 2. Normal Shoppers (Indian Users)
  const normalUsers = [
    {
      name: 'Vikramaditya Rameshwar Verma',
      email: 'vikramaditya.verma@gmail.com',
      address: 'Flat 402, Royal Palms, Aarey Milk Colony, Goregaon East, Mumbai 400065',
      role: 'USER',
    },
    {
      name: 'Priya Ananthalakshmi Iyer',
      email: 'priya.anantha.iyer@gmail.com',
      address: 'B-12, Vasanth Vihar Apartments, Gandhi Nagar, Adyar, Chennai 600020',
      role: 'USER',
    },
    {
      name: 'Rohitashva Jagannath Kulkarni',
      email: 'rohitashva.kulkarni@gmail.com',
      address: 'House 7, Sahakar Nagar, No. 2, Parvati Paytha, Pune 411009',
      role: 'USER',
    },
    {
      name: 'Ananya Chandrasekharan Nair',
      email: 'ananya.cs.nair@gmail.com',
      address: 'Villa 19, Palm Meadows, Ramagondanahalli, Whitefield, Bengaluru 560066',
      role: 'USER',
    },
    {
      name: 'Harpreet Singh Gurunank Sodhi',
      email: 'harpreet.singh.sodhi@gmail.com',
      address: 'H-45, Model Town Phase 2, Near Metro Station, Delhi 110009',
      role: 'USER',
    },
    {
      name: 'Meenakshi Sundaram Pillai',
      email: 'meenakshi.s.pillai@gmail.com',
      address: 'Plot 104, Banjara Hills Road No. 12, Hyderabad, Telangana 500034',
      role: 'USER',
    },
  ];

  // Insert Store Owners and Stores
  const createdStores = [];

  for (const item of storeData) {
    // Check if owner already exists
    let { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', item.owner.email)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{ ...item.owner, password: passwordHash }])
        .select('id, name, email')
        .single();

      if (userError) {
        console.error('Error inserting owner:', item.owner.email, userError.message);
        continue;
      }
      user = newUser;
      console.log(`✅ Created Store Owner: ${user.name}`);
    }

    // Check if store exists
    let { data: store } = await supabase
      .from('stores')
      .select('id, name, email')
      .eq('email', item.store.email)
      .single();

    if (!store) {
      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert([{ ...item.store, owner_id: user.id }])
        .select('id, name, email')
        .single();

      if (storeError) {
        console.error('Error inserting store:', item.store.name, storeError.message);
        continue;
      }
      store = newStore;
      console.log(`✅ Created Store: ${store.name}`);
    }

    createdStores.push(store);
  }

  // Insert Normal Users
  const createdUsers = [];
  for (const u of normalUsers) {
    let { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', u.email)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ ...u, password: passwordHash }])
        .select('id, name, email')
        .single();

      if (error) {
        console.error('Error inserting user:', u.email, error.message);
        continue;
      }
      user = newUser;
      console.log(`✅ Created Normal User: ${user.name}`);
    }
    createdUsers.push(user);
  }

  // Insert Diverse Ratings from Users to Stores
  console.log('⭐ Seeding verified customer ratings and audit trail...');

  // Realistic rating distributions
  const ratingsMatrix = [
    // [userIndex, storeIndex, starRating]
    [0, 0, 5], [1, 0, 5], [2, 0, 4], [3, 0, 5], // Patel Mithai: 4 ratings (avg 4.75)
    [1, 1, 4], [2, 1, 5], [4, 1, 4], [5, 1, 3], // Sri Ganesh Electronics: 4 ratings (avg 4.0)
    [0, 2, 5], [1, 2, 5], [3, 2, 5], [5, 2, 5], // Nalli Silks: 4 ratings (avg 5.0)
    [2, 3, 5], [3, 3, 4], [4, 3, 4],             // Sanjeevani Ayurvedic: 3 ratings (avg 4.33)
    [0, 4, 4], [4, 4, 5], [5, 4, 5],             // Kitab Khana: 3 ratings (avg 4.67)
    [1, 5, 5], [3, 5, 5], [5, 5, 4],             // Mittal Jewellers: 3 ratings (avg 4.67)
    [0, 6, 5], [2, 6, 5], [3, 6, 4], [4, 6, 5], // Arya Bhavan Cafe: 4 ratings (avg 4.75)
    [2, 7, 4], [4, 7, 4], [5, 7, 3],             // Bajrang Hardware: 3 ratings (avg 3.67)
  ];

  for (const [uIdx, sIdx, ratingVal] of ratingsMatrix) {
    const user = createdUsers[uIdx];
    const store = createdStores[sIdx];
    if (!user || !store) continue;

    // Check if rating exists
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user.id)
      .eq('store_id', store.id)
      .single();

    if (!existingRating) {
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert([{ user_id: user.id, store_id: store.id, rating: ratingVal }]);

      if (ratingError) {
        console.error('Error inserting rating:', ratingError.message);
      }
    }
  }

  console.log('🎉 Seeding completed successfully!');
  console.log(`Created ${createdStores.length} Diverse Stores & Owners, ${createdUsers.length} Normal Users.`);
  process.exit(0);
}

seedData().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
