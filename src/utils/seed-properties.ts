import { sequelize, User, OwnerProfile, Property } from '../models';

const imagePool = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop',
];

function getPropertyImages(index: number): string[] {
  // Guaranteed minimum of 8 images (range 8 to 12)
  const count = 8 + (index % 5);
  const start = (index * 3) % imagePool.length;
  const result: string[] = [];

  for (let i = 0; i < count * 3 && result.length < count; i++) {
    const imgIndex = (start + i) % imagePool.length;
    const imgUrl = imagePool[imgIndex];
    if (!result.includes(imgUrl)) {
      result.push(imgUrl);
    }
  }

  // Fallback to ensure we hit full count
  while (result.length < count) {
    const fallbackUrl = imagePool[result.length % imagePool.length];
    result.push(fallbackUrl);
  }

  return result;
}

const locations = [
  // Lagos
  { location: 'Lekki Phase 1, Lagos', city: 'Lekki', state: 'Lagos' },
  { location: 'Banana Island, Ikoyi, Lagos', city: 'Ikoyi', state: 'Lagos' },
  { location: 'Victoria Island, Lagos', city: 'Victoria Island', state: 'Lagos' },
  { location: 'Ikeja GRA, Lagos', city: 'Ikeja', state: 'Lagos' },
  { location: 'Chevron Drive, Lekki, Lagos', city: 'Lekki', state: 'Lagos' },
  { location: 'Ajah, Lagos', city: 'Ajah', state: 'Lagos' },
  { location: 'Phase 3 Maryland, Lagos', city: 'Maryland', state: 'Lagos' },
  { location: 'Surulere, Lagos', city: 'Surulere', state: 'Lagos' },
  { location: 'Gbagada Phase 2, Lagos', city: 'Gbagada', state: 'Lagos' },
  { location: 'Magodo Phase 2, Lagos', city: 'Magodo', state: 'Lagos' },
  // Abuja
  { location: 'Maitama, Abuja', city: 'Maitama', state: 'Abuja' },
  { location: 'Asokoro District, Abuja', city: 'Asokoro', state: 'Abuja' },
  { location: 'Wuse 2, Abuja', city: 'Wuse', state: 'Abuja' },
  { location: 'Guzape Extension, Abuja', city: 'Guzape', state: 'Abuja' },
  { location: 'Works and Housing Gwarinpa, Abuja', city: 'Gwarinpa', state: 'Abuja' },
  { location: 'Jahi Phase 1, Abuja', city: 'Jahi', state: 'Abuja' },
  { location: 'Katampe Main, Abuja', city: 'Katampe', state: 'Abuja' },
  { location: 'Utako District, Abuja', city: 'Utako', state: 'Abuja' },
  { location: 'Jabi Lake Area, Abuja', city: 'Jabi', state: 'Abuja' },
  { location: 'F01 Estate Kubwa, Abuja', city: 'Kubwa', state: 'Abuja' },
  // Port Harcourt & Ibadan
  { location: 'GRA Phase 2, Port Harcourt', city: 'Port Harcourt', state: 'Rivers' },
  { location: 'Bodija Estate, Ibadan', city: 'Ibadan', state: 'Oyo' },
];

const propertyTypes = ['apartment', 'flat', 'duplex', 'terrace', 'villa', 'penthouse', 'land', 'commercial'];

const titlePrefixes = [
  'Luxury', 'Modern', 'Spacious', 'Contemporary', 'Exquisite',
  'Fully Furnished', 'Cozy Serviced', 'Waterfront', 'Executive', 'Newly Built'
];

const tagsPool = [
  ['APARTMENT', 'FURNISHED'],
  ['FLAT', 'DUPLEX'],
  ['ESTATE', 'DUPLEX'],
  ['SHORTLET', 'SERVICED'],
  ['TERRACE', 'FURNISHED'],
  ['VILLA', 'SERVICED'],
  ['PENTHOUSE', 'LUXURY'],
  ['SWAP', 'ESTATE'],
  ['FLAT', 'FURNISHED'],
  ['APARTMENT', 'POOL'],
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for 100 properties...');
    await sequelize.sync({ alter: true });

    // 1. Create or update Demo Owner User
    const [ownerUser] = await User.findOrCreate({
      where: { email: 'owner@sheltax.com' },
      defaults: {
        email: 'owner@sheltax.com',
        firstName: 'Chidiebere',
        surname: 'Eze',
        phoneNumber: '+2348012345678',
        role: 'owner',
        isVerified: true,
      },
    });

    await OwnerProfile.findOrCreate({
      where: { userId: ownerUser.id },
      defaults: {
        userId: ownerUser.id,
        stateOfResidence: 'FCT (Abuja)',
        location: 'FCT (Abuja)',
        propertyTypes: 'residential',
        listingIntent: 'rent',
        ownerType: 'individual',
      },
    });

    console.log(`👤 Owner user created/verified: ${ownerUser.email} (${ownerUser.id})`);

    // 2. Clear existing properties before seeding fresh set
    await Property.destroy({ where: {} });

    // 3. Generate 100 Properties
    const propertySeeds = [];

    for (let i = 0; i < 100; i++) {
      const loc = locations[i % locations.length];
      const pType = propertyTypes[i % propertyTypes.length];
      const prefix = titlePrefixes[i % titlePrefixes.length];
      const bedrooms = (i % 6) + 1;
      const bathrooms = bedrooms + (i % 2);
      const sittingRooms = Math.min(2, Math.max(1, Math.floor(bedrooms / 2)));

      // Determine intent (approx 35% RENT, 35% BUY, 20% SHORTLET, 10% SWAP)
      let intent: 'RENT' | 'BUY' | 'SHORTLET' | 'SWAP';
      let price: number;

      if (i % 10 < 3.5) {
        intent = 'RENT';
        price = (2 + (i % 25)) * 1_000_000; // 2M to 26M
      } else if (i % 10 < 7) {
        intent = 'BUY';
        price = (20 + (i * 3) % 180) * 1_000_000; // 20M to 200M
      } else if (i % 10 < 9) {
        intent = 'SHORTLET';
        price = (60 + (i % 20) * 15) * 1_000; // 60k to 345k / night
      } else {
        intent = 'SWAP';
        price = 0;
      }

      // Featured & Popular flags
      // First 6 of each intent are featured for homepage carousel consistency
      const isFeatured = i < 24 && (i % 4 === 0 || i % 4 === 1);
      const isPopular = (i % 5 === 0) || (i >= 75 && i < 90);

      const title = `${prefix} ${bedrooms} Bedroom ${pType.charAt(0).toUpperCase() + pType.slice(1)}`;
      const description = `${prefix} ${bedrooms} bedroom, ${bathrooms} bathroom ${pType} with ${sittingRooms} sitting room(s), modern fitted kitchen, 24/7 security, constant electricity supply, and ample parking space in ${loc.location}.`;

      propertySeeds.push({
        title,
        description,
        intent,
        propertyType: pType,
        price,
        currency: 'NGN',
        location: loc.location,
        city: loc.city,
        state: loc.state,
        bedrooms,
        bathrooms,
        sittingRooms,
        tags: tagsPool[i % tagsPool.length],
        images: getPropertyImages(i),
        isFeatured,
        isPopular,
        ownerId: ownerUser.id,
      });
    }

    const createdProperties = await Property.bulkCreate(propertySeeds);
    console.log(`✅ Successfully seeded ${createdProperties.length} distinct properties!`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Execute if run directly via CLI
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🎉 100 properties seeding script completed.');
    process.exit(0);
  });
}
