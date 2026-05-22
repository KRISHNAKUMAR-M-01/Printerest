const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean the database
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.save.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const user1 = await prisma.user.create({
    data: {
      username: 'creative_mind',
      email: 'creative@example.com',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
      bio: 'Visual designer & curator of beautiful spaces. Passionate about minimalism, architectural lines, and neutral color tones.'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'pixel_adventurer',
      email: 'pixel@example.com',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200',
      bio: 'Travel photographer exploring the corners of the world. Capturing stories, cultures, and moments through my lens.'
    }
  });

  console.log('Users created.');

  // Create Posts (Pins)
  const postsData = [
    // DESIGN
    {
      title: 'Minimalist Living Room Design',
      description: 'A beautifully balanced minimalist living room showing neutral warm tones, bouclé fabrics, structural oak chairs, and natural lighting.',
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
      authorId: user1.id
    },
    {
      title: 'Modern Typography Poster Art',
      description: 'Abstract editorial design poster using Swiss graphic design principles, high-contrast typography, and bold red layouts.',
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=800',
      authorId: user1.id
    },
    // PHOTOGRAPHY
    {
      title: 'Moody Street Photography in Tokyo',
      description: 'Neon signs glowing in the rain, reflecting on wet asphalt in Shinjuku alleys. Captured on 35mm film.',
      category: 'Photography',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
      authorId: user2.id
    },
    {
      title: 'Golden Hour Portrait',
      description: 'Cinematic warm side lighting showcasing fine art portrait photography in a wild wheat field.',
      category: 'Photography',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
      authorId: user2.id
    },
    // NATURE
    {
      title: 'Mist Rising Over Alpine Lake',
      description: 'Serene early morning reflections at Lago di Braies in the Italian Dolomites, surrounded by dense pine trees and towering mountains.',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
      authorId: user2.id
    },
    // TRAVEL
    {
      title: 'Santorini Sunset Vista',
      description: 'Classic whitewashed buildings and blue domes overlooking the deep blue Aegean sea during golden sunset hour in Oia, Greece.',
      category: 'Travel',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
      authorId: user2.id
    },
    {
      title: 'Cozy Cabin in the Woods',
      description: 'An A-frame wooden cabin glowing warmly in the snow under the northern lights in Lofoten, Norway.',
      category: 'Travel',
      imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=800',
      authorId: user2.id
    },
    // TECH
    {
      title: 'Clean Workspace Setup',
      description: 'Workspace inspiration featuring a dual-monitor arm, mechanical keyboard, wooden desk shelf, and warm ambient light strip.',
      category: 'Tech',
      imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=800',
      authorId: user1.id
    },
    // ART
    {
      title: 'Abstract Fluid Acrylic Painting',
      description: 'Modern fluid art canvas showing marble-like textures of gold, white, and midnight blue swirls.',
      category: 'Art',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
      authorId: user1.id
    },
    // FASHION
    {
      title: 'Autumn Tailored Longcoat Styling',
      description: 'Modern minimal streetwear showing a neutral beige trenchcoat styled with cream trousers and white leather sneakers.',
      category: 'Fashion',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      authorId: user1.id
    }
  ];

  const createdPosts = [];
  for (const postInfo of postsData) {
    const post = await prisma.post.create({
      data: postInfo
    });
    createdPosts.push(post);
  }

  console.log(`${createdPosts.length} posts created.`);

  // Create Comments
  await prisma.comment.create({
    data: {
      content: 'This lighting is absolutely gorgeous! Need to buy that light fixture.',
      postId: createdPosts[0].id, // Minimalist Living Room
      authorId: user2.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Stunning composition. Tokyo is magical in the rain!',
      postId: createdPosts[2].id, // Tokyo Street
      authorId: user1.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Lofoten is a dream! Added to my travel bucket list immediately.',
      postId: createdPosts[6].id, // Norwegian Cabin
      authorId: user1.id
    }
  });

  // Create Likes
  await prisma.like.create({
    data: { postId: createdPosts[0].id, userId: user2.id }
  });
  await prisma.like.create({
    data: { postId: createdPosts[2].id, userId: user1.id }
  });
  await prisma.like.create({
    data: { postId: createdPosts[4].id, userId: user1.id }
  });
  await prisma.like.create({
    data: { postId: createdPosts[4].id, userId: user2.id }
  });

  // Create Saves
  await prisma.save.create({
    data: { postId: createdPosts[0].id, userId: user2.id }
  });
  await prisma.save.create({
    data: { postId: createdPosts[6].id, userId: user1.id }
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
