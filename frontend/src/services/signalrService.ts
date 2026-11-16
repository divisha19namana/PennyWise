// PennyWise SignalR Real-Time Notification Client
// Connects to ASP.NET Core SignalR hub at http://localhost:5191/hub/finance

import * as signalR from '@microsoft/signalr';

export type SignalRCallback = (data: any) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private listeners: { [event: string]: SignalRCallback[] } = {};

  public async connect(): Promise<void> {
    if (this.connection && this.isConnected) return;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5191/hub/finance', {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Setup event routing
      this.connection.on('TransactionRecorded', (data) => this.dispatch('TransactionRecorded', data));
      this.connection.on('TransactionDeleted', (data) => this.dispatch('TransactionDeleted', data));
      this.connection.on('BudgetAlert', (data) => this.dispatch('BudgetAlert', data));
      this.connection.on('ReceiveNotification', (data) => this.dispatch('ReceiveNotification', data));

      await this.connection.start();
      this.isConnected = true;
      console.log('[PennyWise SignalR] Connected successfully to finance hub');
    } catch (err: any) {
      console.warn('[PennyWise SignalR] Realtime hub connection skipped (backend offline or connecting):', err.message);
      this.isConnected = false;
    }
  }

  public on(event: string, callback: SignalRCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unbind function
    return () => {
      this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback) || [];
    };
  }

  private dispatch(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in SignalR listener for ${event}:`, e);
        }
      });
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
    }
  }
}

export const signalRService = new SignalRService();

