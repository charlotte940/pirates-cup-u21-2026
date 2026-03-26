import { useState } from 'react';
import { UtensilsCrossed, Scan, CheckCircle, XCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { nfcService } from '../../services/nfcService';
import type { Staff } from '../../types';

interface FoodScan {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  type: 'food' | 'drink';
  scannedAt: string;
  scannedBy: string;
}

// Mock staff data - about 100 staff members
const MOCK_STAFF: Staff[] = [
  { id: 'staff-1', name: 'John Doe', role: 'ballboy', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-2', name: 'Jane Smith', role: 'ballboy', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-3', name: 'Mike Johnson', role: 'referee', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-4', name: 'Sarah Williams', role: 'referee', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-5', name: 'David Brown', role: 'fieldmanager', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-6', name: 'Emily Davis', role: 'admin', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-7', name: 'Chris Wilson', role: 'catering', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-8', name: 'Lisa Anderson', role: 'other', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  // Add more staff as needed
];

export default function CateringDashboard() {
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [scanHistory, setScanHistory] = useState<FoodScan[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<FoodScan | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'staff' | 'history'>('scan');

  // Calculate stats
  const totalStaff = staffList.length;
  const foodCollected = staffList.filter(s => s.foodCollected).length;
  const drinkCollected = staffList.filter(s => s.drinkCollected).length;
  const remainingFood = totalStaff - foodCollected;

  const handleScan = async (type: 'food' | 'drink') => {
    setIsScanning(true);
    setScanError(null);
    
    try {
      // Try to read NFC tag
      const tagData = await nfcService.readTag();
      
      if (tagData) {
        // Find staff by NFC tag or playerId
        const staff = staffList.find(s => s.nfcTag === tagData.tagId || s.id === tagData.playerId);
        
        if (staff) {
          // Check if already collected
          if (type === 'food' && staff.foodCollected) {
            setScanError(`${staff.name} has already collected food today`);
            setIsScanning(false);
            return;
          }
          if (type === 'drink' && staff.drinkCollected) {
            setScanError(`${staff.name} has already collected drink today`);
            setIsScanning(false);
            return;
          }
          
          // Update staff record
          const updatedStaff = staffList.map(s => {
            if (s.id === staff.id) {
              return {
                ...s,
                foodCollected: type === 'food' ? true : s.foodCollected,
                foodCollectedAt: type === 'food' ? new Date().toISOString() : s.foodCollectedAt,
                drinkCollected: type === 'drink' ? true : s.drinkCollected,
                drinkCollectedAt: type === 'drink' ? new Date().toISOString() : s.drinkCollectedAt,
              };
            }
            return s;
          });
          setStaffList(updatedStaff);
          
          // Add to scan history
          const scan: FoodScan = {
            id: `scan-${Date.now()}`,
            staffId: staff.id,
            staffName: staff.name,
            staffRole: staff.role,
            type,
            scannedAt: new Date().toISOString(),
            scannedBy: 'Catering Staff',
          };
          setScanHistory(prev => [scan, ...prev]);
          setLastScan(scan);
        } else {
          setScanError('Staff member not found');
        }
      } else {
        // Demo mode - simulate successful scan with random staff
        const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
        
        // Check if already collected
        if (type === 'food' && randomStaff.foodCollected) {
          setScanError(`${randomStaff.name} has already collected food today`);
          setIsScanning(false);
          return;
        }
        if (type === 'drink' && randomStaff.drinkCollected) {
          setScanError(`${randomStaff.name} has already collected drink today`);
          setIsScanning(false);
          return;
        }
        
        // Update staff record
        const updatedStaff = staffList.map(s => {
          if (s.id === randomStaff.id) {
            return {
              ...s,
              foodCollected: type === 'food' ? true : s.foodCollected,
              foodCollectedAt: type === 'food' ? new Date().toISOString() : s.foodCollectedAt,
              drinkCollected: type === 'drink' ? true : s.drinkCollected,
              drinkCollectedAt: type === 'drink' ? new Date().toISOString() : s.drinkCollectedAt,
            };
          }
          return s;
        });
        setStaffList(updatedStaff);
        
        // Add to scan history
        const scan: FoodScan = {
          id: `scan-${Date.now()}`,
          staffId: randomStaff.id,
          staffName: randomStaff.name,
          staffRole: randomStaff.role,
          type,
          scannedAt: new Date().toISOString(),
          scannedBy: 'Catering Staff',
        };
        setScanHistory(prev => [scan, ...prev]);
        setLastScan(scan);
      }
    } catch (error) {
      setScanError('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ballboy': return 'bg-blue-100 text-blue-700';
      case 'referee': return 'bg-amber-100 text-amber-700';
      case 'fieldmanager': return 'bg-green-100 text-green-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'catering': return 'bg-pink-100 text-pink-700';
      case 'casual': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-pirates-black uppercase">Catering Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-pirates-gray-600">System Ready</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pirates-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-pirates-gray-500 text-xs uppercase">Total Staff</p>
          </div>
          <p className="font-heading text-2xl font-bold text-pirates-black">{totalStaff}</p>
        </div>
        <div className="pirates-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-pirates-gray-500 text-xs uppercase">Food Collected</p>
          </div>
          <p className="font-heading text-2xl font-bold text-green-600">{foodCollected}</p>
        </div>
        <div className="pirates-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-pirates-gray-500 text-xs uppercase">Drink Collected</p>
          </div>
          <p className="font-heading text-2xl font-bold text-amber-600">{drinkCollected}</p>
        </div>
        <div className="pirates-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pirates-red" />
            </div>
            <p className="text-pirates-gray-500 text-xs uppercase">Remaining</p>
          </div>
          <p className="font-heading text-2xl font-bold text-pirates-red">{remainingFood}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-pirates-gray-200">
        {[
          { id: 'scan', label: 'Scan NFC', icon: Scan },
          { id: 'staff', label: 'Staff List', icon: Users },
          { id: 'history', label: 'Scan History', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-pirates-red text-pirates-red'
                : 'border-transparent text-pirates-gray-500 hover:text-pirates-black'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {/* Scan Buttons */}
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleScan('food')}
              disabled={isScanning}
              className="pirates-card p-8 flex flex-col items-center justify-center gap-4 hover:border-pirates-red transition-colors group"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <UtensilsCrossed className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-pirates-black uppercase">Scan for Food</p>
                <p className="text-pirates-gray-500 text-sm mt-1">Tap NFC tag to record food collection</p>
              </div>
            </button>

            <button
              onClick={() => handleScan('drink')}
              disabled={isScanning}
              className="pirates-card p-8 flex flex-col items-center justify-center gap-4 hover:border-amber-500 transition-colors group"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <UtensilsCrossed className="w-10 h-10 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-pirates-black uppercase">Scan for Drink</p>
                <p className="text-pirates-gray-500 text-sm mt-1">Tap NFC tag to record drink collection</p>
              </div>
            </button>
          </div>

          {/* Last Scan Result */}
          {lastScan && (
            <div className="pirates-card p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-heading text-lg font-bold text-green-800 uppercase">Last Scan Successful</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-pirates-gray-500 text-xs uppercase">Staff Name</p>
                  <p className="font-medium text-pirates-black">{lastScan.staffName}</p>
                </div>
                <div>
                  <p className="text-pirates-gray-500 text-xs uppercase">Role</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(lastScan.staffRole)}`}>
                    {lastScan.staffRole}
                  </span>
                </div>
                <div>
                  <p className="text-pirates-gray-500 text-xs uppercase">Type</p>
                  <p className="font-medium text-pirates-black capitalize">{lastScan.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Double Collection Alert */}
          {scanError && (
            <div className="pirates-card p-6 bg-red-100 border-2 border-red-500 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-red-700 font-bold text-lg">ALREADY COLLECTED!</p>
                  <p className="text-red-600 font-medium">{scanError}</p>
                  <p className="text-red-500 text-sm mt-1">This person cannot collect again today.</p>
                </div>
              </div>
            </div>
          )}

          {/* Scanning Indicator */}
          {isScanning && (
            <div className="pirates-card p-8 text-center">
              <div className="w-16 h-16 border-4 border-pirates-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-heading text-lg font-bold text-pirates-black">Scanning...</p>
              <p className="text-pirates-gray-500 text-sm">Please tap the NFC tag</p>
            </div>
          )}
        </div>
      )}

      {/* Staff List Tab */}
      {activeTab === 'staff' && (
        <div className="pirates-card p-6">
          <h3 className="section-title text-base mb-4">Staff List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pirates-gray-200">
                  <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Role</th>
                  <th className="text-center py-3 px-4 text-pirates-gray-500 text-xs uppercase">Food</th>
                  <th className="text-center py-3 px-4 text-pirates-gray-500 text-xs uppercase">Drink</th>
                  <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Collected At</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-pirates-gray-100 hover:bg-pirates-gray-50">
                    <td className="py-3 px-4 font-medium text-pirates-black">{staff.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(staff.role)}`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {staff.foodCollected ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {staff.drinkCollected ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-pirates-gray-500">
                      {staff.foodCollectedAt ? formatTime(staff.foodCollectedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="pirates-card p-6">
          <h3 className="section-title text-base mb-4">Scan History</h3>
          {scanHistory.length === 0 ? (
            <div className="text-center py-8 text-pirates-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scans yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      scan.type === 'food' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <UtensilsCrossed className={`w-5 h-5 ${
                        scan.type === 'food' ? 'text-green-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-pirates-black">{scan.staffName}</p>
                      <p className="text-pirates-gray-500 text-sm">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${getRoleColor(scan.staffRole)}`}>
                          {scan.staffRole}
                        </span>
                        {formatTime(scan.scannedAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    scan.type === 'food' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {scan.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
