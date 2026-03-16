const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsersAndBusinesses() {
  const users = await prisma.user.findMany({
    include: {
      businesses: true
    }
  });

  console.log("Usuarios encontrados:", users.length);
  users.forEach(u => {
    console.log(`Usuario: ${u.email} (ID: ${u.id})`);
    if (u.businesses && u.businesses.length > 0) {
      u.businesses.forEach(b => {
        console.log(`  - Negocio: ${b.name} (ID: ${b.id})`);
        console.log(`    Token Telegram: ${b.telegramBotToken ? 'SI' : 'NO'}`);
      });
    } else {
      console.log("  - Sin negocios.");
    }
  });
}

listUsersAndBusinesses()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

