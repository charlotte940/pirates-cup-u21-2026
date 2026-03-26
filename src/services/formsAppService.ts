/**
 * Forms.app Integration Service
 * 
 * HOW IT WORKS:
 * 1. Create a form on forms.app with fields for team registration
 * 2. Get your API key from forms.app dashboard
 * 3. Call initialize() with your API key and form ID
 * 4. Use importTeams() to fetch all team submissions
 * 
 * FOR TESTING (Current Setup):
 * - The service uses MOCK data for demo purposes
 * - Click "Import from Forms.app" to see demo teams imported
 * - In production, replace MOCK_FORMS_APP_DATA with actual API calls
 * 
 * REQUIRED FORM FIELDS:
 * - Team Name (text)
 * - Coach Name (text)
 * - Coach Phone (phone)
 * - Coach Email (email)
 * - Group (dropdown: A-H)
 * - Players (repeating section with: Name, Jersey Number, Position, Date of Birth)
 */

export interface FormsAppSubmission {
  id: string;
  submittedAt: string;
  teamName: string;
  coachName: string;
  coachPhone: string;
  coachEmail: string;
  group: string;
  players: FormsAppPlayer[];
}

export interface FormsAppPlayer {
  name: string;
  jerseyNumber: number;
  position: string;
  dateOfBirth: string;
  idNumber?: string;
  nfcTagId?: string;
}

// Simulated forms.app data - in production, this would come from the API
const MOCK_FORMS_APP_DATA: FormsAppSubmission[] = [
  {
    id: 'sub-001',
    submittedAt: '2026-03-15T10:30:00Z',
    teamName: 'Orlando Pirates U21',
    coachName: 'John Mokoena',
    coachPhone: '082 123 4567',
    coachEmail: 'coach@piratesfc.co.za',
    group: 'A',
    players: [
      { name: 'Thabo Mokoena', jerseyNumber: 10, position: 'Forward', dateOfBirth: '2005-03-15' },
      { name: 'Sipho Dlamini', jerseyNumber: 7, position: 'Midfielder', dateOfBirth: '2005-06-22' },
      { name: 'Lungile Nkosi', jerseyNumber: 4, position: 'Defender', dateOfBirth: '2004-11-08' },
      { name: 'Bongani Zulu', jerseyNumber: 1, position: 'Goalkeeper', dateOfBirth: '2005-01-30' },
      { name: 'Kabelo Moeketsi', jerseyNumber: 9, position: 'Forward', dateOfBirth: '2005-09-12' },
    ]
  },
  {
    id: 'sub-002',
    submittedAt: '2026-03-15T11:15:00Z',
    teamName: 'Kaizer Chiefs U21',
    coachName: 'David Khumalo',
    coachPhone: '083 987 6543',
    coachEmail: 'coach@chiefsfc.co.za',
    group: 'A',
    players: [
      { name: 'Eric Mathoho', jerseyNumber: 5, position: 'Defender', dateOfBirth: '2004-09-20' },
      { name: 'Itumeleng Khune', jerseyNumber: 32, position: 'Goalkeeper', dateOfBirth: '2005-02-14' },
      { name: 'Bernard Parker', jerseyNumber: 25, position: 'Forward', dateOfBirth: '2005-07-08' },
      { name: 'Willard Katsande', jerseyNumber: 31, position: 'Midfielder', dateOfBirth: '2004-12-03' },
    ]
  },
  {
    id: 'sub-003',
    submittedAt: '2026-03-15T12:00:00Z',
    teamName: 'Mamelodi Sundowns U21',
    coachName: 'Pitso Mosimane',
    coachPhone: '084 555 7777',
    coachEmail: 'coach@sundowns.co.za',
    group: 'B',
    players: [
      { name: 'Hlompho Kekana', jerseyNumber: 8, position: 'Midfielder', dateOfBirth: '2005-05-23' },
      { name: 'Themba Zwane', jerseyNumber: 18, position: 'Forward', dateOfBirth: '2004-08-11' },
      { name: 'Denis Onyango', jerseyNumber: 14, position: 'Goalkeeper', dateOfBirth: '2005-03-30' },
      { name: 'Ricardo Nascimento', jerseyNumber: 6, position: 'Defender', dateOfBirth: '2004-10-17' },
    ]
  },
  {
    id: 'sub-004',
    submittedAt: '2026-03-15T13:45:00Z',
    teamName: 'SuperSport United U21',
    coachName: 'Kaitano Tembo',
    coachPhone: '082 444 8888',
    coachEmail: 'coach@supersport.co.za',
    group: 'B',
    players: [
      { name: 'Bradley Grobler', jerseyNumber: 9, position: 'Forward', dateOfBirth: '2005-01-25' },
      { name: 'Ronwen Williams', jerseyNumber: 30, position: 'Goalkeeper', dateOfBirth: '2004-06-14' },
      { name: 'Thulani Hlatshwayo', jerseyNumber: 3, position: 'Defender', dateOfBirth: '2005-04-02' },
    ]
  },
];

class FormsAppService {
  // Initialize with API credentials (stored for future API integration)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialize(_apiKey: string, _formId: string, _webhookUrl?: string) {
    // Credentials stored for when real API integration is implemented
  }

  // Fetch all submissions from forms.app
  async fetchSubmissions(): Promise<FormsAppSubmission[]> {
    // In production, this would be:
    // const response = await fetch(`https://api.forms.app/v1/forms/${this.formId}/submissions`, {
    //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
    // });
    // return response.json();
    
    // For demo, return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_FORMS_APP_DATA), 1000);
    });
  }

  // Import submissions and convert to app format
  async importTeams(): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    teams: FormsAppSubmission[];
  }> {
    try {
      const submissions = await this.fetchSubmissions();
      
      // Validate submissions
      const errors: string[] = [];
      const validTeams = submissions.filter((sub, index) => {
        if (!sub.teamName) {
          errors.push(`Submission ${index + 1}: Missing team name`);
          return false;
        }
        if (!sub.players || sub.players.length === 0) {
          errors.push(`Submission ${index + 1}: No players listed`);
          return false;
        }
        return true;
      });

      return {
        success: true,
        imported: validTeams.length,
        errors,
        teams: validTeams
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: ['Failed to fetch submissions from forms.app'],
        teams: []
      };
    }
  }

  // Set up webhook listener for real-time updates
  setupWebhookListener(callback: (submission: FormsAppSubmission) => void) {
    // In production, this would set up a webhook endpoint
    // that receives POST requests from forms.app
    console.log('Webhook listener set up');
    
    // For demo, simulate a new submission every 30 seconds
    const interval = setInterval(() => {
      const mockNewSubmission: FormsAppSubmission = {
        id: `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        teamName: 'New Team Registration',
        coachName: 'New Coach',
        coachPhone: '082 000 0000',
        coachEmail: 'new@team.co.za',
        group: 'C',
        players: [
          { name: 'New Player 1', jerseyNumber: 1, position: 'Forward', dateOfBirth: '2005-01-01' },
        ]
      };
      callback(mockNewSubmission);
    }, 30000);

    return () => clearInterval(interval);
  }

  // Export data to CSV for backup
  exportToCSV(submissions: FormsAppSubmission[]): string {
    const headers = ['Team Name', 'Coach', 'Phone', 'Email', 'Group', 'Player Name', 'Jersey', 'Position', 'DOB'];
    const rows: string[] = [headers.join(',')];

    submissions.forEach(sub => {
      sub.players.forEach(player => {
        rows.push([
          sub.teamName,
          sub.coachName,
          sub.coachPhone,
          sub.coachEmail,
          sub.group,
          player.name,
          player.jerseyNumber,
          player.position,
          player.dateOfBirth
        ].join(','));
      });
    });

    return rows.join('\n');
  }

  // Get import status
  getImportStatus(): {
    lastImport: string | null;
    totalTeams: number;
    totalPlayers: number;
    pendingSync: number;
  } {
    return {
      lastImport: '2026-03-15 14:30:00',
      totalTeams: MOCK_FORMS_APP_DATA.length,
      totalPlayers: MOCK_FORMS_APP_DATA.reduce((acc, t) => acc + t.players.length, 0),
      pendingSync: 0
    };
  }

  // Import match schedule from forms.app
  async importMatchSchedule(): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    matches: Array<{
      id: string;
      homeTeam: string;
      awayTeam: string;
      date: string;
      time: string;
      venue: string;
      field: string;
      group: string;
    }>;
  }> {
    // In production, this would fetch from forms.app API
    // For demo, return mock match schedule data
    const mockMatches = [
      { id: 'm1', homeTeam: 'Orlando Pirates U21', awayTeam: 'Kaizer Chiefs U21', date: '2026-04-12', time: '09:00', venue: 'wits-marks-park', field: 'A', group: 'A' },
      { id: 'm2', homeTeam: 'Mamelodi Sundowns U21', awayTeam: 'SuperSport U21', date: '2026-04-12', time: '09:00', venue: 'sturrock-park', field: 'A', group: 'A' },
      { id: 'm3', homeTeam: 'Cape Town City U21', awayTeam: 'Stellenbosch FC U21', date: '2026-04-12', time: '11:00', venue: 'wits-marks-park', field: 'B', group: 'B' },
      { id: 'm4', homeTeam: 'AmaZulu FC U21', awayTeam: 'Golden Arrows U21', date: '2026-04-12', time: '11:00', venue: 'sturrock-park', field: 'B', group: 'B' },
    ];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          imported: mockMatches.length,
          errors: [],
          matches: mockMatches
        });
      }, 1000);
    });
  }
}

export const formsAppService = new FormsAppService();
