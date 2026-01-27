import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMatchData() {
  const teams = await prisma.team.findMany({
    include: {
      wins: {
        take: 1,
        select: { id: true, date: true }
      },
      stats: {
        take: 1
      },
      drafts: {
        take: 1
      }
    }
  });

  console.log(`\n📊 Teams with Match Data:\n`);
  
  teams.forEach(team => {
    const hasWins = team.wins.length > 0;
    const hasStats = team.stats.length > 0;
    const hasDrafts = team.drafts.length > 0;
    
    if (hasWins || hasStats || hasDrafts) {
      console.log(`✅ ${team.name}`);
      console.log(`   Wins: ${team.wins.length}, Stats: ${team.stats.length}, Drafts: ${team.drafts.length}`);
    }
  });
  
  await prisma.$disconnect();
}

checkMatchData().catch(console.error);
