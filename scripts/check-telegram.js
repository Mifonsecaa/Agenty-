const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTelegramConnection() {
  const business = await prisma.business.findFirst({
    where: {
      telegramBotToken: {
        not: null
      }
    }
  });

  if (business) {
    console.log("✅ Conexión encontrada:");
    console.log(`- Business ID: ${business.id}`);
    console.log(`- Bot Username: @${business.telegramBotUsername}`);
    console.log(`- Token (parcial): ${business.telegramBotToken.substring(0, 10)}...`);
    
    // Check webhook status
    const url = `https://api.telegram.org/bot${business.telegramBotToken}/getWebhookInfo`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("\n📡 Estado del Webhook en Telegram:");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log("❌ No se encontró ningún negocio conectado a Telegram en la base de datos.");
  }
}

checkTelegramConnection()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

