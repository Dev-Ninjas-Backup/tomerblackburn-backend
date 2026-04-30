import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrafficService } from './traffic.service';

interface ActiveSession {
  role: 'visitor' | 'admin';
  connectedAt: number;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  page: string | null;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'traffic',
})
export class TrafficGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly activeSessions = new Map<string, ActiveSession>();

  constructor(private readonly trafficService: TrafficService) {}

  handleConnection(client: Socket) {
    const q = client.handshake.query;
    const role = (q.role as string) === 'admin' ? 'admin' : 'visitor';

    const rawIp =
      (client.handshake.headers['x-forwarded-for'] as string) ||
      client.handshake.address;
    const ipAddress =
      rawIp?.split(',')[0].trim().replace('::ffff:', '') || null;

    this.activeSessions.set(client.id, {
      role,
      connectedAt: Date.now(),
      ipAddress,
      userAgent: (client.handshake.headers['user-agent'] as string) || null,
      referrer:
        (client.handshake.headers['referer'] as string) ||
        (client.handshake.headers['origin'] as string) ||
        null,
      page: (q.page as string) || null,
    });

    this.broadcastStats();
  }

  handleDisconnect(client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session?.role === 'visitor') {
      const disconnectedAt = new Date();
      const connectedAt = new Date(session.connectedAt);
      const durationSeconds = Math.round(
        (disconnectedAt.getTime() - session.connectedAt) / 1000,
      );

      this.trafficService
        .saveSession({
          socketId: client.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          referrer: session.referrer,
          page: session.page,
          connectedAt,
          disconnectedAt,
          durationSeconds,
        })
        .catch(() => {});
    }

    this.activeSessions.delete(client.id);
    this.broadcastStats();
  }

  private broadcastStats() {
    const now = Date.now();
    const visitorSessions = Array.from(this.activeSessions.values()).filter(
      (s) => s.role === 'visitor',
    );

    const activeDurations = visitorSessions.map(
      (s) => (now - s.connectedAt) / 1000,
    );

    const avgDuration =
      this.trafficService.getInMemoryAvgDuration(activeDurations);

    this.server.emit('traffic:update', {
      liveVisitors: visitorSessions.length,
      avgDuration,
      totalTracked: this.trafficService.getTrackedCount(activeDurations.length),
    });
  }
}
