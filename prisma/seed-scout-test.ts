import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMockTeam() {
  console.log('Creating mock team data for scouting report testing...');

  // Create a test team
  const team = await prisma.team.upsert({
    where: { name: 'Test Scouting Team' },
    update: {},
    create: {
      name: 'Test Scouting Team',
      region: 'NA',
      league: 'LCS Championship',
    },
  });

  console.log('✅ Created team:', team.name);

  // Create a series
  const series = await prisma.series.upsert({
    where: { gridSeriesId: 'mock-series-1' },
    update: {},
    create: {
      gridSeriesId: 'mock-series-1',
      tournamentName: 'LCS Spring 2024',
      format: 'Bo3',
      startTime: new Date('2024-01-15'),
      teams: {
        connect: [{ id: team.id }]
      }
    },
  });

  // Create 10 mock matches
  const champions = ['Ahri', 'Azir', 'Jinx', 'Kai\'Sa', 'Lee Sin', 'Thresh', 'Leona', 'Orianna', 'Lucian', 'Sylas'];
  
  for (let i = 0; i < 10; i++) {
    const isWin = i < 6; // 6 wins, 4 losses (60% win rate)
    
    const match = await prisma.match.create({
      data: {
        gridMatchId: `mock-match-${i + 1}`,
        seriesId: series.id,
        date: new Date(2024, 0, 15 + i),
        patch: '14.2',
        duration: 1800 + Math.random() * 600, // 30-40 minutes
        winnerId: isWin ? team.id : null,
        formatType: 'Bo3',
        tournamentName: 'LCS Spring 2024',
        gameTitle: 'LoL',
      },
    });

    // Create draft picks and bans
    await prisma.draft.create({
      data: {
        matchId: match.id,
        teamId: team.id,
        picks: JSON.stringify(champions.slice(i % 5, (i % 5) + 5)),
        bans: JSON.stringify(champions.slice((i + 2) % 5, ((i + 2) % 5) + 3)),
        winProbability: isWin ? 0.65 : 0.45,
      },
    });

    console.log(`✅ Created match ${i + 1}/10 (${isWin ? 'Win' : 'Loss'})`);
  }

  console.log('\n🎉 Mock data created successfully!');
  console.log('You can now test scouting reports with team: "Test Scouting Team"');
  
  await prisma.$disconnect();
}

seedMockTeam()
  .catch((e) => {
    console.error('Error seeding mock data:', e);
    process.exit(1);
  });
