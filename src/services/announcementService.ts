// Announcement Service for Tournament Manager to Field Manager communication

export interface Announcement {
  id: string;
  from: string;
  fromRole: 'manager' | 'registration';
  to: string[];
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sentAt: string;
  readBy: string[];
  acknowledgedBy: string[];
}

export interface AnnouncementRecipient {
  id: string;
  name: string;
  role: string;
  venue: string;
  field: string;
  online: boolean;
  lastSeen: string;
}

class AnnouncementService {
  private announcements: Announcement[] = [];
  private listeners: ((announcement: Announcement) => void)[] = [];

  // Field managers list - UJ Sports Grounds (6 fields)
  private fieldManagers: AnnouncementRecipient[] = [
    { id: 'fm-a', name: 'Field Manager - Field A', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'A', online: true, lastSeen: 'Just now' },
    { id: 'fm-b', name: 'Field Manager - Field B', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'B', online: true, lastSeen: 'Just now' },
    { id: 'fm-c', name: 'Field Manager - Field C', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'C', online: true, lastSeen: 'Just now' },
    { id: 'fm-d', name: 'Field Manager - Field D', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'D', online: true, lastSeen: 'Just now' },
    { id: 'fm-e', name: 'Field Manager - Field E', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'E', online: true, lastSeen: 'Just now' },
    { id: 'fm-f', name: 'Field Manager - Field F', role: 'fieldmanager', venue: 'UJ Sports Grounds', field: 'F', online: true, lastSeen: 'Just now' },
  ];

  // Send announcement from Tournament Manager
  async sendAnnouncement(
    from: string,
    message: string,
    options: {
      to?: string[];
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      allFieldManagers?: boolean;
    } = {}
  ): Promise<{ success: boolean; announcement: Announcement | null; error?: string }> {
    try {
      let recipients: string[] = [];

      if (options.allFieldManagers) {
        recipients = this.fieldManagers.map(fm => fm.id);
      } else if (options.to) {
        recipients = options.to;
      } else {
        recipients = this.fieldManagers.map(fm => fm.id);
      }

      const announcement: Announcement = {
        id: `ann-${Date.now()}`,
        from,
        fromRole: 'manager',
        to: recipients,
        message,
        priority: options.priority || 'normal',
        sentAt: new Date().toISOString(),
        readBy: [],
        acknowledgedBy: []
      };

      this.announcements.push(announcement);

      // Notify all listeners
      this.listeners.forEach(listener => listener(announcement));

      // Simulate push notification
      this.sendPushNotification(announcement);

      return { success: true, announcement };
    } catch (error) {
      return { success: false, announcement: null, error: 'Failed to send announcement' };
    }
  }

  // Get all announcements for a recipient
  getAnnouncementsForRecipient(recipientId: string): Announcement[] {
    return this.announcements
      .filter(ann => ann.to.includes(recipientId))
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // Get all announcements (for manager view)
  getAllAnnouncements(): Announcement[] {
    return [...this.announcements].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  // Mark announcement as read
  markAsRead(announcementId: string, recipientId: string): void {
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (announcement && !announcement.readBy.includes(recipientId)) {
      announcement.readBy.push(recipientId);
    }
  }

  // Acknowledge announcement
  acknowledge(announcementId: string, recipientId: string): void {
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (announcement && !announcement.acknowledgedBy.includes(recipientId)) {
      announcement.acknowledgedBy.push(recipientId);
    }
  }

  // Get unread count for recipient
  getUnreadCount(recipientId: string): number {
    return this.announcements.filter(
      ann => ann.to.includes(recipientId) && !ann.readBy.includes(recipientId)
    ).length;
  }

  // Subscribe to new announcements
  subscribe(callback: (announcement: Announcement) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Get all field managers
  getFieldManagers(): AnnouncementRecipient[] {
    return this.fieldManagers;
  }

  // Get online status
  getOnlineStatus(): { online: number; total: number } {
    return {
      online: this.fieldManagers.filter(fm => fm.online).length,
      total: this.fieldManagers.length
    };
  }

  // Simulate push notification
  private sendPushNotification(announcement: Announcement): void {
    // In production, this would use Firebase Cloud Messaging or similar
    console.log(`[PUSH NOTIFICATION] To ${announcement.to.length} recipients: ${announcement.message.substring(0, 50)}...`);
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pirates Cup U21 - New Announcement', {
        body: announcement.message,
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: announcement.id
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Get delivery stats for an announcement
  getDeliveryStats(announcementId: string): {
    sent: number;
    read: number;
    acknowledged: number;
    pending: number;
  } {
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) {
      return { sent: 0, read: 0, acknowledged: 0, pending: 0 };
    }

    return {
      sent: announcement.to.length,
      read: announcement.readBy.length,
      acknowledged: announcement.acknowledgedBy.length,
      pending: announcement.to.length - announcement.readBy.length
    };
  }

  // Delete announcement
  deleteAnnouncement(announcementId: string): boolean {
    const index = this.announcements.findIndex(a => a.id === announcementId);
    if (index > -1) {
      this.announcements.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  }

  // Get priority label
  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'urgent': return 'URGENT';
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  }
}

export const announcementService = new AnnouncementService();
