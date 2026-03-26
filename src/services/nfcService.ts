/**
 * NFC Service for programming and reading NFC tags
 * Supports NTAG213, NTAG215, NTAG216 tags
 * 
 * HOW IT WORKS:
 * 1. Purchase NFC tags (NTAG213/215 recommended - available on Takealot)
 * 2. Use Chrome browser on Android device (Web NFC API required)
 * 3. Admin clicks "Program NFC" for a staff member
 * 4. Hold the NFC tag against the back of the phone
 * 5. The tag is programmed with: Staff Name, Role, and unique ID
 * 6. Catering staff scan the tag to record food collection
 * 
 * REQUIREMENTS:
 * - Android device with NFC capability
 * - Chrome browser (Web NFC API not supported on iOS yet)
 * - NFC tags (NTAG213/215 recommended)
 * 
 * TAG STORAGE:
 * Each tag stores: { tagId, playerId, playerName, teamName, programmedAt }
 * This allows the system to identify who scanned and prevent double collection
 */

export interface NFCTagData {
  tagId: string;
  playerId: string;
  playerName: string;
  teamName: string;
  jerseyNumber: number;
  programmedAt?: string;
}

export interface NFCProgrammingResult {
  success: boolean;
  tagId: string;
  message: string;
}

class NFCService {
  private isSupported: boolean = false;

  constructor() {
    // Check if Web NFC API is supported
    this.isSupported = 'NDEFReader' in window;
  }

  // Check if NFC is supported on this device
  isNFCSupported(): boolean {
    return this.isSupported;
  }

  // Generate unique NFC tag ID
  generateTagId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PC26-${timestamp}-${random}`;
  }

  // Program an NFC tag with player data
  async programTag(playerData: {
    playerId: string;
    playerName: string;
    teamName: string;
    jerseyNumber: number;
  }): Promise<NFCProgrammingResult> {
    if (!this.isSupported) {
      return {
        success: false,
        tagId: '',
        message: 'NFC not supported on this device. Use Chrome on Android.'
      };
    }

    try {
      // @ts-ignore - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();
      
      const tagId = this.generateTagId();
      const record = {
        tagId,
        playerId: playerData.playerId,
        playerName: playerData.playerName,
        teamName: playerData.teamName,
        jerseyNumber: playerData.jerseyNumber,
        programmedAt: new Date().toISOString()
      };

      await ndef.write({
        records: [{
          recordType: 'mime',
          mediaType: 'application/json',
          data: JSON.stringify(record)
        }]
      });

      return {
        success: true,
        tagId,
        message: `Tag programmed successfully for ${playerData.playerName}`
      };
    } catch (error: any) {
      return {
        success: false,
        tagId: '',
        message: error.message || 'Failed to program NFC tag'
      };
    }
  }

  // Read an NFC tag
  async readTag(): Promise<NFCTagData | null> {
    if (!this.isSupported) {
      console.log('NFC not supported');
      return null;
    }

    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.scan();

      return new Promise((resolve) => {
        ndef.addEventListener('reading', (event: any) => {
          const message = event.message;
          
          for (const record of message.records) {
            if (record.recordType === 'mime' && record.mediaType === 'application/json') {
              const decoder = new TextDecoder();
              const data = JSON.parse(decoder.decode(record.data));
              resolve(data);
              return;
            }
          }
          resolve(null);
        });
      });
    } catch (error) {
      console.error('Error reading NFC tag:', error);
      return null;
    }
  }

  // Simulate programming (for demo/testing)
  async simulateProgramTag(playerData: {
    playerId: string;
    playerName: string;
    teamName: string;
    jerseyNumber: number;
  }): Promise<NFCProgrammingResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tagId = this.generateTagId();
        resolve({
          success: true,
          tagId,
          message: `SIMULATION: Tag programmed for ${playerData.playerName}`
        });
      }, 2000);
    });
  }

  // Simulate reading (for demo/testing)
  async simulateReadTag(): Promise<NFCTagData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          tagId: 'PC26-ABC123-XYZ',
          playerId: 'p1',
          playerName: 'Thabo Mokoena',
          teamName: 'Orlando Pirates U21',
          jerseyNumber: 10,
          programmedAt: new Date().toISOString()
        });
      }, 1500);
    });
  }

  // Get NFC tag recommendations
  getTagRecommendations(): {
    type: string;
    capacity: string;
    price: string;
    url: string;
  }[] {
    return [
      {
        type: 'NTAG213',
        capacity: '144 bytes',
        price: 'R5-8 each',
        url: 'https://www.takealot.com/nfc-tags'
      },
      {
        type: 'NTAG215',
        capacity: '504 bytes',
        price: 'R8-12 each',
        url: 'https://www.takealot.com/nfc-tags'
      },
      {
        type: 'NTAG216',
        capacity: '924 bytes',
        price: 'R12-15 each',
        url: 'https://www.takealot.com/nfc-tags'
      },
      {
        type: 'NFC Wristbands (Silicone)',
        capacity: 'NTAG213/215',
        price: 'R15-25 each',
        url: 'https://www.takealot.com/nfc-wristbands'
      }
    ];
  }

  // Get programming instructions
  getProgrammingInstructions(): string[] {
    return [
      'Purchase NFC tags (NTAG213/215 recommended)',
      'Use Chrome browser on Android device',
      'Enable NFC in phone settings',
      'Place tag on back of phone',
      'Wait for "Tag detected" message',
      'Click "Program Tag" button',
      'Hold tag steady until confirmation',
      'Test by reading the tag'
    ];
  }
}

export const nfcService = new NFCService();
