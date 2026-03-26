import { useState } from 'react';
import { Smartphone, CheckCircle, User, Users, Trophy } from 'lucide-react';

export default function NFCCheckIn() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);

  const handleScan = () => {
    setScanning(true);
    setScanResult(null);
    
    setTimeout(() => {
      setScanning(false);
      setScanResult('success');
      setScannedData({
        type: 'player',
        name: 'Zakhele Lepasa',
        team: 'Orlando Pirates U21',
        number: 9,
        checkInTime: new Date().toLocaleTimeString(),
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pirates-card p-8">
        <div className="text-center max-w-md mx-auto">
          <h3 className="section-title mb-2">NFC Check-In</h3>
          <p className="text-pirates-gray-500 mb-8">Tap an NFC tag to check in players, teams, or verify access</p>

          <button onClick={handleScan} disabled={scanning} className="relative w-48 h-48 mx-auto mb-8">
            <div className={`absolute inset-0 rounded-full border-4 ${scanning ? 'border-pirates-red/50 nfc-scan' : 'border-pirates-red/20'}`} />
            <div className={`absolute inset-4 rounded-full border-4 ${scanning ? 'border-pirates-red/40' : 'border-pirates-red/15'}`} />
            <div className="absolute inset-8 rounded-full bg-pirates-red/10 flex items-center justify-center">
              <Smartphone className={`w-12 h-12 ${scanning ? 'text-pirates-red' : 'text-pirates-red/60'}`} />
            </div>
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-4 border-pirates-red border-t-transparent animate-spin" />
              </div>
            )}
          </button>

          <p className="text-pirates-black font-medium">{scanning ? 'Scanning...' : 'Tap to simulate NFC scan'}</p>
        </div>
      </div>

      {scanResult === 'success' && scannedData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-green-600 font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" />Check-in Successful</p>
              <p className="text-pirates-black font-heading text-xl font-bold">{scannedData.name}</p>
              <p className="text-pirates-gray-600">{scannedData.team} • #{scannedData.number}</p>
              <p className="text-pirates-gray-500 text-sm mt-1">Checked in at {scannedData.checkInTime}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="pirates-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-pirates-red" />
            </div>
            <div>
              <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Teams Checked In</p>
              <p className="font-heading text-2xl font-bold text-pirates-black">3/4</p>
            </div>
          </div>
        </div>

        <div className="pirates-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-pirates-red" />
            </div>
            <div>
              <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Players Checked In</p>
              <p className="font-heading text-2xl font-bold text-pirates-black">47/64</p>
            </div>
          </div>
        </div>

        <div className="pirates-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-pirates-red" />
            </div>
            <div>
              <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Matches Ready</p>
              <p className="font-heading text-2xl font-bold text-pirates-black">2/4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">Recent Check-ins</h3>
        <div className="space-y-3">
          {[
            { name: 'Sipho Chaine', team: 'Orlando Pirates U21', time: '2 mins ago', type: 'player' },
            { name: 'Mamelodi Sundowns U21', team: 'Full Squad', time: '5 mins ago', type: 'team' },
            { name: 'Victor Gomes', team: 'Referee', time: '8 mins ago', type: 'referee' },
            { name: 'Nkosinathi Sibisi', team: 'Orlando Pirates U21', time: '12 mins ago', type: 'player' },
          ].map((checkin, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-pirates-gray-50 rounded-xl border border-pirates-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-pirates-black font-medium">{checkin.name}</p>
                <p className="text-pirates-gray-500 text-sm">{checkin.team}</p>
              </div>
              <span className="text-pirates-gray-400 text-sm">{checkin.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">NFC Tag Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { location: 'Team Registration Desk', purpose: 'Team & Player Check-in' },
            { location: 'Match Entry Gates', purpose: 'Player Verification' },
            { location: 'Referee Room', purpose: 'Referee Check-in' },
            { location: 'Media Center', purpose: 'Media Access' },
            { location: 'VIP Areas', purpose: 'Secure Access Control' },
            { location: 'Medical Station', purpose: 'Player Medical Check' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-pirates-gray-50 rounded-xl border border-pirates-gray-100">
              <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-pirates-red" />
              </div>
              <div>
                <p className="text-pirates-black font-medium text-sm">{item.location}</p>
                <p className="text-pirates-gray-500 text-xs">{item.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
