const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 10 });
  console.log(`Found ${users.length} users to seed.`);

  for (let i = 0; i < users.length; i++) {
    // Give random winnings between 50.0 and 8000.0
    const randomWinnings = Math.floor(Math.random() * 8000) + 50;
    await prisma.user.update({
      where: { id: users[i].id },
      data: { totalWinnings: randomWinnings }
    });
    console.log(`Updated ${users[i].username} with ₹${randomWinnings}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
