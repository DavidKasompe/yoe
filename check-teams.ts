import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTeams() {
  const teams = await prisma.team.findMany({
    take: 20,
    select: {
      id: true,
      name: true,
      region: true,
      league: true,
      _count: {
        select: {
          wins: true,
        }
      }
    }
  });

  console.log(`\n📊 Found ${teams.length} teams in database:\n`);
  
  if (teams.length === 0) {
    console.log('❌ No teams found! You need to ingest match data first.');
    console.log('\nTo ingest data, use the /api/ingest endpoint with a GRID match ID.');
  } else {
    teams.forEach((team, i) => {
      console.log(`${i + 1}. ${team.name} (${team.region || 'Unknown'}) - ${team._count.wins} wins`);
    });
    console.log('\n✅ Try generating a report for one of these teams!');
  }
  
  await prisma.$disconnect();
}

checkTeams().catch(console.error);
