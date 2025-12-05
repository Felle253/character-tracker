
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching characters...');
    const charactersRaw = await prisma.character.findMany({
        orderBy: { createdAt: 'desc' },
        include: { games: { orderBy: { createdAt: 'desc' } }, owner: true }
    });

    console.log(`Found ${charactersRaw.length} characters.`);

    const list = charactersRaw.map((c) => {
        const total = c.games.length;
        // Fixed logic:
        const wins = c.games.filter((g) => g.result === 'WIN').length;
        
        const losses = total - wins;
        const winRate = total === 0 ? 0 : Math.round((wins / total) * 1000) / 10; 

        return {
            id: c.id,
            name: c.name,
            wins,
            winRate
        };
    });

    console.log('Successfully processed characters with fixed logic.');
    console.log('Sample character stats:', list[0]);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
