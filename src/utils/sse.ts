import { getToken } from './auth';

export interface SSEEvent {
  type: string;
  data: any;
}

export class SSEClient {
  private controller: AbortController | null = null;
  private url: string;
  private listeners: Map<string, Function[]> = new Map();
  private connection: Promise<Response> | null = null;
  private retryAttempts: number = 0;
  private maxRetryAttempts: number = 5;
  public isConnected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }


  private createHeaders(): Headers {
    const headers = new Headers();
    const token = getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private async connectToServer(): Promise<Response> {
    if (this.controller) {
      this.controller.abort();
    }
    this.controller = new AbortController();

    try {
      const headers = this.createHeaders();
      console.log('Connecting to SSE with headers:', headers);
      
      const response = await fetch(this.url, {
        method: 'GET',
        headers: headers,
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('SSE connection established successfully');
      this.isConnected = true;
      return response;
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async handleConnection(): Promise<void> {
    try {
      console.log('Starting SSE connection');
      this.connection = this.connectToServer();
      const response = await this.connection;

      if (!response.body) {
        throw new Error('No readable stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('SSE stream ended');
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Extract the data part from the line (format: 'data: {json}')
              const dataMatch = line.trim().match(/^data:\s*(.*)$/);
              if (dataMatch) {
                const eventData = dataMatch[1];
                const event = JSON.parse(eventData);
                console.log('Received SSE event:', event);
                this.triggerEvent(event.type, event.payload);
              } else {
                console.log('Received non-data line:', line.trim());
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
              console.error('Failed to parse:', line.trim());
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE connection error:', error);
      this.retryAttempts++;
      if (this.retryAttempts < this.maxRetryAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
        console.log(`Attempting to reconnect in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        this.connect();
      } else {
        console.error('Max retry attempts reached. Giving up.');
      this.isConnected = false;
      }
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("already connected")
      return;
    }

    this.retryAttempts = 0;
    try {
      await this.handleConnection();
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      throw error; // Rethrow to trigger reconnection
    }
  }

  private triggerEvent(type: string, payload: any): void {
    const callbacks = this.listeners.get(type) || [];
    const event: SSEEvent = { type, data: payload };
    callbacks.forEach(callback => callback(event));
    console.log('Triggering event:', { type, payload });
  }

  public on(event: string, callback: (event: SSEEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  public disconnect(): void {
    if (this.controller) {
      this.controller.abort();
    }
    this.connection = null;
    this.isConnected = false;
    this.listeners.clear();
    this.retryAttempts = 0;
  }
}
