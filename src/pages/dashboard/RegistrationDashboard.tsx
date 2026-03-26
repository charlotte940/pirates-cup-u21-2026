import { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, Users, MapPin, Search, X, ChevronRight, Download, RefreshCw, CreditCard, Edit3, AlertCircle, ExternalLink } from 'lucide-react';
import { allTeams } from '../../data/teamsData';
import { formsAppService, type FormsAppSubmission } from '../../services/formsAppService';
import { nfcService } from '../../services/nfcService';

interface CheckInRecord {
  id: string;
  name: string;
  team?: string;
  role: string;
  location: string;
  time: string;
  status: 'checked-in' | 'vetted';
}

interface PlayerWithNFC {
  id: string;
  name: string;
  jerseyNumber: number;
  teamName: string;
  nfcTagId?: string;
  nfcProgrammed?: boolean;
}

export default function RegistrationDashboard() {
  const [activeTab, setActiveTab] = useState<'checkin' | 'nfc-program' | 'import'>('checkin');
  const [selectedTeam, setSelectedTeam] = useState<typeof allTeams[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInStep, setCheckInStep] = useState<'search' | 'team-found' | 'nfc-scan' | 'complete'>('search');
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([
    { id: '1', name: 'Orlando Pirates U21', team: 'Full Squad', role: 'Team', location: 'Main Gate A', time: '2 mins ago', status: 'checked-in' },
    { id: '2', name: 'Kaizer Chiefs U21', team: 'Full Squad', role: 'Team', location: 'Gate B - Players', time: '5 mins ago', status: 'vetted' },
    { id: '3', name: 'Victor Gomes', role: 'Referee', location: 'Gate C - Media', time: '8 mins ago', status: 'vetted' },
    { id: '4', name: 'Mamelodi Sundowns U21', team: 'Full Squad', role: 'Team', location: 'Field A Access', time: '12 mins ago', status: 'checked-in' },
  ]);

  // NFC Programming state
  const [selectedPlayerForNFC, setSelectedPlayerForNFC] = useState<PlayerWithNFC | null>(null);
  const [nfcProgramming, setNfcProgramming] = useState(false);
  const [nfcResult, setNfcResult] = useState<{ success: boolean; message: string; tagId?: string } | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);

  // Forms.app import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
    teams: FormsAppSubmission[];
  } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [formId, setFormId] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);

  // Players list with NFC status
  const [players, setPlayers] = useState<PlayerWithNFC[]>(() => {
    const allPlayers: PlayerWithNFC[] = [];
    allTeams.forEach(team => {
      team.players.forEach((player, idx) => {
        allPlayers.push({
          id: `${team.id}-p${idx}`,
          name: player.name,
          jerseyNumber: player.number,
          teamName: team.name,
          nfcProgrammed: false
        });
      });
    });
    return allPlayers;
  });

  useEffect(() => {
    setNfcSupported(nfcService.isNFCSupported());
  }, []);

  const filteredTeams = allTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTeam = (team: typeof allTeams[0]) => {
    setSelectedTeam(team);
    setCheckInStep('team-found');
  };

  const handleStartNfcCheckIn = () => {
    setCheckInStep('nfc-scan');
    
    setTimeout(() => {
      setCheckInStep('complete');
      
      const newCheckIn: CheckInRecord = {
        id: Date.now().toString(),
        name: selectedTeam?.name || 'Unknown',
        team: selectedTeam?.name,
        role: 'Team',
        location: 'Main Gate A',
        time: 'Just now',
        status: 'checked-in',
      };
      
      setCheckInHistory([newCheckIn, ...checkInHistory]);
    }, 2000);
  };

  const resetCheckIn = () => {
    setSelectedTeam(null);
    setCheckInStep('search');
    setSearchQuery('');
  };

  // NFC Programming
  const handleProgramNFC = async (player: PlayerWithNFC) => {
    setSelectedPlayerForNFC(player);
    setNfcProgramming(true);
    setNfcResult(null);

    const result = await nfcService.simulateProgramTag({
      playerId: player.id,
      playerName: player.name,
      teamName: player.teamName,
      jerseyNumber: player.jerseyNumber
    });

    setNfcProgramming(false);
    setNfcResult(result);

    if (result.success && result.tagId) {
      setPlayers(prev => prev.map(p => 
        p.id === player.id 
          ? { ...p, nfcProgrammed: true, nfcTagId: result.tagId }
          : p
      ));
    }
  };

  // Forms.app Import
  const handleImportFromFormsApp = async () => {
    setImporting(true);
    setImportResult(null);

    // Initialize with provided credentials
    formsAppService.initialize(apiKey || 'demo-key', formId || 'demo-form');

    const result = await formsAppService.importTeams();
    setImportResult(result);
    setImporting(false);
  };

  const exportToCSV = () => {
    if (!importResult?.teams) return;
    const csv = formsAppService.exportToCSV(importResult.teams);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pirates-cup-teams.csv';
    a.click();
  };

  const stats = {
    teamsCheckedIn: checkInHistory.filter(c => c.role === 'Team').length,
    totalTeams: 32,
    playersCheckedIn: checkInHistory.filter(c => c.role === 'Player').length + 
      checkInHistory.filter(c => c.role === 'Team').reduce((acc, t) => acc + (allTeams.find(team => team.name === t.team)?.players.length || 0), 0),
    totalPlayers: 192,
    pending: 32 - checkInHistory.filter(c => c.role === 'Team').length,
    nfcProgrammed: players.filter(p => p.nfcProgrammed).length,
    nfcPending: players.filter(p => !p.nfcProgrammed).length,
  };

  const tagRecommendations = nfcService.getTagRecommendations();
  const programmingInstructions = nfcService.getProgrammingInstructions();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'checkin' ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Team Check-in
        </button>
        <button
          onClick={() => setActiveTab('nfc-program')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'nfc-program' ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          NFC Programming
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
            {stats.nfcPending} pending
          </span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'import' ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'
          }`}
        >
          <Download className="w-4 h-4" />
          Import from Forms.app
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-pirates-red">{stats.teamsCheckedIn}/{stats.totalTeams}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Teams Checked In</p>
        </div>
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-green-600">{stats.playersCheckedIn}/{stats.totalPlayers}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Players Checked In</p>
        </div>
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-pirates-black">{stats.teamsCheckedIn}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Completed</p>
        </div>
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Pending</p>
        </div>
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-blue-600">{stats.nfcProgrammed}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">NFC Programmed</p>
        </div>
        <div className="pirates-card p-4 text-center">
          <p className="font-heading text-2xl font-bold text-purple-600">{stats.nfcPending}</p>
          <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">NFC Pending</p>
        </div>
      </div>

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <>
          {/* Step 1: Search for Team */}
          {checkInStep === 'search' && (
            <div className="pirates-card p-6">
              <h3 className="section-title text-base mb-4">Step 1: Find Team</h3>
              <p className="text-pirates-gray-500 mb-4">Search for the team to check in</p>
              
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pirates-gray-400" />
                <input
                  type="text"
                  placeholder="Search team name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-pirates-gray-200 rounded-lg text-pirates-black text-lg placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10"
                />
              </div>

              {searchQuery && (
                <div className="space-y-2 max-h-64 overflow-auto border border-pirates-gray-200 rounded-lg">
                  {filteredTeams.length > 0 ? filteredTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleSelectTeam(team)}
                      className="w-full flex items-center justify-between p-4 bg-pirates-gray-50 hover:bg-pirates-red/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-pirates-red" />
                        </div>
                        <div>
                          <p className="text-pirates-black font-medium">{team.name}</p>
                          <p className="text-pirates-gray-500 text-sm">Group {team.group} • {team.players.length} players • Coach: {team.coach}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-pirates-gray-400" />
                    </button>
                  )) : (
                    <div className="p-4 text-center text-pirates-gray-500">No teams found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Team Found */}
          {checkInStep === 'team-found' && selectedTeam && (
            <div className="pirates-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-base mb-0">Step 2: Confirm Team</h3>
                <button onClick={resetCheckIn} className="text-pirates-gray-500 hover:text-pirates-red">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-pirates-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-pirates-red" />
                  </div>
                  <div>
                    <h4 className="font-heading text-2xl font-bold text-pirates-black">{selectedTeam.name}</h4>
                    <p className="text-pirates-gray-500">Group {selectedTeam.group} • {selectedTeam.players.length} players</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-pirates-gray-500">Coach:</span>
                    <span className="text-pirates-black ml-2 font-medium">{selectedTeam.coach}</span>
                  </div>
                  <div>
                    <span className="text-pirates-gray-500">Contact:</span>
                    <span className="text-pirates-black ml-2 font-medium">{selectedTeam.contactPhone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartNfcCheckIn}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Proceed to NFC Check-in
              </button>
            </div>
          )}

          {/* Step 3: NFC Scan */}
          {checkInStep === 'nfc-scan' && (
            <div className="pirates-card p-8">
              <div className="text-center max-w-md mx-auto">
                <h3 className="section-title text-lg mb-2">Step 3: NFC Check-in</h3>
                <p className="text-pirates-gray-500 mb-6">Tap NFC wristbands to register arrival</p>

                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-pirates-red/20 nfc-scan" />
                  <div className="absolute inset-4 rounded-full border-4 border-pirates-red/30" />
                  <div className="absolute inset-8 rounded-full bg-pirates-red/10 flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-pirates-red" />
                  </div>
                </div>

                <p className="text-pirates-black font-medium text-lg animate-pulse">Scanning...</p>
                <p className="text-pirates-gray-500 text-sm mt-2">Tap wristbands one by one</p>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {checkInStep === 'complete' && (
            <div className="pirates-card p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-green-600 mb-2">Check-in Complete!</h3>
                <p className="text-pirates-gray-600">{selectedTeam?.name} has been registered</p>
                <p className="text-pirates-gray-500 text-sm">{selectedTeam?.players.length} players checked in</p>
              </div>

              <div className="flex gap-3">
                <button onClick={resetCheckIn} className="flex-1 btn-outline">
                  Check In Another Team
                </button>
                <button onClick={() => setCheckInStep('search')} className="flex-1 btn-primary">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Recent Check-ins */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Recent Check-ins</h3>
            <div className="space-y-3">
              {checkInHistory.filter(c => c.role === 'Team').slice(0, 5).map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-pirates-black font-medium">{checkin.name}</p>
                      <p className="text-pirates-gray-500 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {checkin.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-pirates-gray-500 text-sm">{checkin.time}</span>
                    <p className="text-green-600 text-xs font-medium">✓ Checked In</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* NFC Programming Tab */}
      {activeTab === 'nfc-program' && (
        <>
          {/* NFC Status */}
          <div className={`pirates-card p-4 ${nfcSupported ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${nfcSupported ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Smartphone className={`w-5 h-5 ${nfcSupported ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${nfcSupported ? 'text-green-800' : 'text-amber-800'}`}>
                  {nfcSupported ? 'NFC is supported on this device' : 'NFC not available on this device'}
                </p>
                <p className={`text-sm ${nfcSupported ? 'text-green-600' : 'text-amber-600'}`}>
                  {nfcSupported 
                    ? 'You can program NFC tags directly' 
                    : 'Use Chrome on Android or simulate programming for demo'}
                </p>
              </div>
            </div>
          </div>

          {/* Player Search */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Program NFC Tags for Players</h3>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pirates-gray-400" />
              <input
                type="text"
                placeholder="Search player by name or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10"
              />
            </div>

            {/* Players List */}
            <div className="space-y-2 max-h-96 overflow-auto">
              {(searchQuery ? filteredPlayers : players).map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      player.nfcProgrammed ? 'bg-green-100' : 'bg-pirates-gray-200'
                    }`}>
                      {player.nfcProgrammed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-pirates-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-pirates-black font-medium">#{player.jerseyNumber} {player.name}</p>
                      <p className="text-pirates-gray-500 text-sm">{player.teamName}</p>
                      {player.nfcTagId && (
                        <p className="text-green-600 text-xs">Tag: {player.nfcTagId}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleProgramNFC(player)}
                    disabled={nfcProgramming && selectedPlayerForNFC?.id === player.id}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      player.nfcProgrammed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-pirates-red text-white hover:bg-pirates-red/90'
                    }`}
                  >
                    {nfcProgramming && selectedPlayerForNFC?.id === player.id ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Programming...
                      </span>
                    ) : player.nfcProgrammed ? (
                      <span className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Reprogram
                      </span>
                    ) : (
                      'Program Tag'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Programming Result */}
          {nfcResult && (
            <div className={`pirates-card p-4 ${nfcResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                {nfcResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${nfcResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {nfcResult.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm ${nfcResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {nfcResult.message}
                  </p>
                  {nfcResult.tagId && (
                    <p className="text-green-700 text-sm font-mono mt-1">Tag ID: {nfcResult.tagId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">How to Program NFC Tags</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-pirates-black mb-3">Recommended NFC Tags</h4>
                <div className="space-y-2">
                  {tagRecommendations.map((tag, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-pirates-gray-50 rounded-lg">
                      <div>
                        <p className="text-pirates-black font-medium text-sm">{tag.type}</p>
                        <p className="text-pirates-gray-500 text-xs">{tag.capacity} • {tag.price}</p>
                      </div>
                      <a 
                        href={tag.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pirates-red hover:underline text-sm flex items-center gap-1"
                      >
                        Buy <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-pirates-black mb-3">Programming Steps</h4>
                <ol className="space-y-2">
                  {programmingInstructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-pirates-gray-700">
                      <span className="w-5 h-5 bg-pirates-red text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Import from Forms.app Tab */}
      {activeTab === 'import' && (
        <>
          {/* Import Form */}
          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-base mb-0">Import Teams from Forms.app</h3>
                <p className="text-pirates-gray-500 text-sm">Import team and player registrations from your forms.app form</p>
              </div>
              <button
                onClick={() => setShowImportForm(!showImportForm)}
                className="text-pirates-red hover:underline text-sm"
              >
                {showImportForm ? 'Hide Settings' : 'Show Settings'}
              </button>
            </div>

            {showImportForm && (
              <div className="bg-pirates-gray-50 rounded-xl p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-pirates-gray-600 mb-1">API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your forms.app API key"
                      className="w-full px-4 py-2 border border-pirates-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pirates-gray-600 mb-1">Form ID</label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="Enter your form ID"
                      className="w-full px-4 py-2 border border-pirates-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <p className="text-pirates-gray-500 text-xs mt-2">
                  Leave blank to use demo data. Get your API key from forms.app dashboard → Settings → API.
                </p>
              </div>
            )}

            <button
              onClick={handleImportFromFormsApp}
              disabled={importing}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Importing from Forms.app...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Import Teams from Forms.app
                </>
              )}
            </button>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className={`pirates-card p-6 ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {importResult.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <p className={`font-heading text-xl font-bold ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {importResult.success ? 'Import Successful!' : 'Import Failed'}
                  </p>
                  <p className={`text-sm ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {importResult.success 
                      ? `${importResult.imported} teams imported successfully`
                      : importResult.errors[0]
                    }
                  </p>
                </div>
              </div>

              {importResult.success && importResult.teams.length > 0 && (
                <>
                  <div className="space-y-3 mb-4">
                    {importResult.teams.map((team) => (
                      <div key={team.id} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-pirates-black">{team.teamName}</p>
                            <p className="text-sm text-pirates-gray-500">
                              Group {team.group} • {team.players.length} players • Coach: {team.coachName}
                            </p>
                          </div>
                          <span className="text-green-600 text-sm font-medium">✓ Imported</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={exportToCSV}
                    className="w-full py-3 bg-white border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export to CSV (Backup)
                  </button>
                </>
              )}

              {importResult.errors.length > 0 && (
                <div className="mt-4 bg-red-100 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-2">Errors:</p>
                  <ul className="list-disc list-inside text-red-600 text-sm">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Import Status */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Import Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-pirates-red">{importResult?.teams.length || 0}</p>
                <p className="text-pirates-gray-500 text-xs uppercase">Teams Imported</p>
              </div>
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-blue-600">
                  {importResult?.teams.reduce((acc, t) => acc + t.players.length, 0) || 0}
                </p>
                <p className="text-pirates-gray-500 text-xs uppercase">Players Imported</p>
              </div>
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-green-600">
                  {formsAppService.getImportStatus().lastImport || 'Never'}
                </p>
                <p className="text-pirates-gray-500 text-xs uppercase">Last Import</p>
              </div>
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-amber-600">
                  {formsAppService.getImportStatus().pendingSync}
                </p>
                <p className="text-pirates-gray-500 text-xs uppercase">Pending Sync</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
