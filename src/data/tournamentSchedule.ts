// Pirates Cup U21 2026 - Complete Tournament Schedule
// Venue: UJ Sports Grounds (6 fields)
// Ladies: 16 teams, 4 groups of 4
// Men's: 56 teams, 14 groups of 4

export interface ScheduledMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: 'uj-sports-grounds';
  field: string;
  group: string;
  gender: 'ladies' | 'mens';
  round?: string;
  status: 'scheduled' | 'live' | 'completed';
  homeScore?: number;
  awayScore?: number;
}

// LADIES TEAMS - 16 teams, 4 groups of 4 (using actual registered team names)
export const ladiesTeams: Record<string, string[]> = {
  'A': ['EMMARENTIA PIRATES LADIES', 'JVW', 'MAMELODI SUNDOWNS', 'MONATE TWAA'],
  'B': ['MPHEHLI ALL STARS', 'MPUMALANGA RISING STARS LADIES', 'NSINGIZINI HOTSPURS FC', 'NWU SOCCER INSTITUTE'],
  'C': ['PANORAMA LADIES', 'SINTHUMULE KUTAMA FC', 'TS GALAXY', 'UNIVERSITY OF JOHANNESBURG'],
  'D': ['UNIVERSITY OF LIMPOPO', 'UNIVERSITY OF PRETORIA', 'WINDHOEK CITY SPORTING CLUB', 'WITS UNIVERSITY']
};

// MEN'S TEAMS - 56 teams, 14 groups of 4 (using actual registered team names)
export const mensTeams: Record<string, string[]> = {
  'A': ['AKHONA FOOTBALL ACADEMY', 'AMAHLE TELTONIKA', 'AMBASSADORS', 'ARMY ROCKETS'],
  'B': ['AUGUSTO PALACIOS ACADEMY', 'DEBUNKERS', 'DUBE CONTINENTAL', 'ECSN FC'],
  'C': ['EMALAHLENI LFA', 'EMALAHLENI UNITED', 'ERESA', 'EUPHORIA FC'],
  'D': ['FC 14 SOWETO', 'FC LEAPERS', 'FC REVIVAL', 'GALESHEWE STARS'],
  'E': ['IMMIG FC', 'JAMES MOTHIBI ACADEMY', 'JL ZWANE', 'JOZI RAPIDS FC'],
  'F': ['KATHORUS JUVENTUS', 'LAMBANI FOOTBALL ACADEMY', 'LANGALIBALELE FC', 'LEMA SPORTS'],
  'G': ['LERUMO LIONS', 'LIMPOPO SCHOOL OF EXCELLENCE', 'MAFIKENG FOOTBALL ACADEMY', 'MAPALIES SPORTS ACADEMY'],
  'H': ['MEADOWLANDS ACADEMY FC', 'MIDLANDS ACADEMY', 'MPHEHLI ALL STARS', 'NEASM ACADEMY'],
  'I': ['NIDA SPORTS ACADEMY', 'NSINGIZINI HOTSPURS FC', 'NWU SOCCER INSTITUTE', 'ORBIT COLLEGE'],
  'J': ['ORLANDO PIRATES', 'PANORAMA FOOTBALL CLUB', 'PHEZULU FC', 'QB INGOMUSO'],
  'K': ['R R FOOTBALL DEVELOPMENT', 'SCOTTLAND FC', 'SINENKANI FC', 'TEMBISA DESTROYERS'],
  'L': ['THE IMMORTALS FOOTBALL ACADEMY', 'TIKI TAKA SPORTS ACADEMY', 'TIME TIGERS', 'TOTAL FOOTBALL EXCELLENCE'],
  'M': ['TS GALAXY', 'UMKHANYAKUDE SELECT', 'UMSINGA UNITED', 'UNIVERSITY OF JOHANNESBURG'],
  'N': ['UNIVERSITY OF PRETORIA', 'VHEMBE TRON FC', 'WITS UNIVERSITY', 'YOUNG PIRATES']
};

// UJ Sports Grounds - 6 fields
export const UJ_FIELDS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Generate group stage matches for a group
function generateGroupMatches(
  teams: string[],
  group: string,
  gender: 'ladies' | 'mens',
  date: string,
  _startTime: string,
  fieldOffset: number
): ScheduledMatch[] {
  const matches: ScheduledMatch[] = [];
  
  // Round-robin format: each team plays every other team once
  // For 4 teams: 6 matches total (3 rounds of 2 matches each)
  const matchups = [
    [0, 1, 2, 3], // Round 1: Team 1 vs Team 2, Team 3 vs Team 4
    [0, 2, 1, 3], // Round 2: Team 1 vs Team 3, Team 2 vs Team 4
    [0, 3, 1, 2], // Round 3: Team 1 vs Team 4, Team 2 vs Team 3
  ];
  
  // Match times from Excel schedule: 09:00-10:10, 10:15-11:25, 11:30-12:40, 12:45-13:55, 14:00-15:10, 15:15-16:25
  const times = ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15'];
  
  matchups.forEach((round, roundIndex) => {
    // Match 1 of this round
    matches.push({
      id: `${gender}-g${group}-r${roundIndex + 1}-m1`,
      homeTeam: teams[round[0]],
      awayTeam: teams[round[1]],
      date,
      time: times[roundIndex * 2 + fieldOffset],
      venue: 'uj-sports-grounds',
      field: UJ_FIELDS[(fieldOffset + roundIndex) % 6],
      group: `${gender === 'ladies' ? 'L' : 'M'}-${group}`,
      gender,
      round: `Round ${roundIndex + 1}`,
      status: 'scheduled'
    });
    
    // Match 2 of this round
    matches.push({
      id: `${gender}-g${group}-r${roundIndex + 1}-m2`,
      homeTeam: teams[round[2]],
      awayTeam: teams[round[3]],
      date,
      time: times[roundIndex * 2 + 1 + fieldOffset],
      venue: 'uj-sports-grounds',
      field: UJ_FIELDS[(fieldOffset + roundIndex + 1) % 6],
      group: `${gender === 'ladies' ? 'L' : 'M'}-${group}`,
      gender,
      round: `Round ${roundIndex + 1}`,
      status: 'scheduled'
    });
  });
  
  return matches;
}

// Generate all tournament matches
export function generateTournamentSchedule(): ScheduledMatch[] {
  const matches: ScheduledMatch[] = [];
  
  // Day 1: Thursday, 3 April 2026 - Group Stage (Ladies Groups A, B, C, D + Men's Groups A, B, C, D)
  let fieldOffset = 0;
  
  // Ladies Day 1 - Groups A, B
  ['A', 'B'].forEach((group) => {
    matches.push(...generateGroupMatches(ladiesTeams[group], group, 'ladies', '2026-04-03', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Men's Day 1 - Groups A, B, C, D
  ['A', 'B', 'C', 'D'].forEach((group) => {
    matches.push(...generateGroupMatches(mensTeams[group], group, 'mens', '2026-04-03', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Day 2: Friday, 4 April 2026 - Group Stage (Ladies Groups C, D + Men's Groups E, F, G, H)
  fieldOffset = 0;
  
  // Ladies Day 2 - Groups C, D
  ['C', 'D'].forEach((group) => {
    matches.push(...generateGroupMatches(ladiesTeams[group], group, 'ladies', '2026-04-04', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Men's Day 2 - Groups E, F, G, H
  ['E', 'F', 'G', 'H'].forEach((group) => {
    matches.push(...generateGroupMatches(mensTeams[group], group, 'mens', '2026-04-04', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Day 3: Saturday, 5 April 2026 - Group Stage (Men's Groups I, J, K, L)
  fieldOffset = 0;
  
  // Men's Day 3 - Groups I, J, K, L
  ['I', 'J', 'K', 'L'].forEach((group) => {
    matches.push(...generateGroupMatches(mensTeams[group], group, 'mens', '2026-04-05', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Day 4: Sunday, 6 April 2026 - Group Stage (Men's Groups M, N) + Knockouts
  fieldOffset = 0;
  
  // Men's Day 4 - Groups M, N
  ['M', 'N'].forEach((group) => {
    matches.push(...generateGroupMatches(mensTeams[group], group, 'mens', '2026-04-06', '08:00', fieldOffset));
    fieldOffset = (fieldOffset + 2) % 6;
  });
  
  // Quarter Finals - Ladies
  matches.push(
    { id: 'ladies-qf1', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '12:00', venue: 'uj-sports-grounds', field: 'A', group: 'L-QF', gender: 'ladies', round: 'Quarter Final', status: 'scheduled' },
    { id: 'ladies-qf2', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '12:00', venue: 'uj-sports-grounds', field: 'B', group: 'L-QF', gender: 'ladies', round: 'Quarter Final', status: 'scheduled' },
    { id: 'ladies-qf3', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '13:30', venue: 'uj-sports-grounds', field: 'A', group: 'L-QF', gender: 'ladies', round: 'Quarter Final', status: 'scheduled' },
    { id: 'ladies-qf4', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '13:30', venue: 'uj-sports-grounds', field: 'B', group: 'L-QF', gender: 'ladies', round: 'Quarter Final', status: 'scheduled' }
  );
  
  // Semi Finals - Ladies
  matches.push(
    { id: 'ladies-sf1', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '15:00', venue: 'uj-sports-grounds', field: 'A', group: 'L-SF', gender: 'ladies', round: 'Semi Final', status: 'scheduled' },
    { id: 'ladies-sf2', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '15:00', venue: 'uj-sports-grounds', field: 'B', group: 'L-SF', gender: 'ladies', round: 'Semi Final', status: 'scheduled' }
  );
  
  // Final - Ladies
  matches.push(
    { id: 'ladies-final', homeTeam: 'TBD', awayTeam: 'TBD', date: '2026-04-06', time: '17:00', venue: 'uj-sports-grounds', field: 'A', group: 'L-F', gender: 'ladies', round: 'Final', status: 'scheduled' }
  );
  
  return matches;
}

// Export all tournament matches
export const allTournamentMatches: ScheduledMatch[] = generateTournamentSchedule();

// Calculate group standings
export function calculateGroupStandings(group: string, gender: 'ladies' | 'mens') {
  const teams = gender === 'ladies' ? ladiesTeams[group] : mensTeams[group];
  
  return teams.map(team => {
    const teamMatches = allTournamentMatches.filter(
      m => m.group === `${gender === 'ladies' ? 'L' : 'M'}-${group}` && 
           (m.homeTeam === team || m.awayTeam === team) &&
           m.status === 'completed'
    );
    
    let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0, points = 0;
    
    teamMatches.forEach(match => {
      played++;
      const isHome = match.homeTeam === team;
      const teamGoals = isHome ? (match.homeScore || 0) : (match.awayScore || 0);
      const opponentGoals = isHome ? (match.awayScore || 0) : (match.homeScore || 0);
      
      goalsFor += teamGoals;
      goalsAgainst += opponentGoals;
      
      if (teamGoals > opponentGoals) {
        won++;
        points += 3;
      } else if (teamGoals === opponentGoals) {
        drawn++;
        points += 1;
      } else {
        lost++;
      }
    });
    
    return {
      name: team,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points
    };
  }).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
}

// Get matches for a specific field
export function getMatchesByField(field: string): ScheduledMatch[] {
  return allTournamentMatches.filter(m => m.field === field);
}

// Get matches for a specific date
export function getMatchesByDate(date: string): ScheduledMatch[] {
  return allTournamentMatches.filter(m => m.date === date);
}

// Get live or upcoming matches for a field
export function getFieldMatches(field: string, date?: string): ScheduledMatch[] {
  let matches = allTournamentMatches.filter(m => m.field === field);
  if (date) {
    matches = matches.filter(m => m.date === date);
  }
  return matches.sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
}
