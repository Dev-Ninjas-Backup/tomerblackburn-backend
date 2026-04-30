import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface SaveSessionDto {
  socketId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  page: string | null;
  connectedAt: Date;
  disconnectedAt: Date;
  durationSeconds: number;
}

@Injectable()
export class TrafficService implements OnModuleInit {
  private recentDurations: number[] = [];
  private totalVisitors = 0;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const [recent, total] = await Promise.all([
      this.prisma.visitorSession.findMany({
        orderBy: { connectedAt: 'desc' },
        take: 200,
        select: { durationSeconds: true },
      }),
      this.prisma.visitorSession.count(),
    ]);
    this.recentDurations = recent.map((r) => r.durationSeconds);
    this.totalVisitors = total;
  }

  async saveSession(data: SaveSessionDto) {
    const record = await this.prisma.visitorSession.create({ data });
    this.recentDurations.unshift(data.durationSeconds);
    if (this.recentDurations.length > 200) this.recentDurations.pop();
    this.totalVisitors += 1;
    return record;
  }

  getTotalVisitors(): number {
    return this.totalVisitors;
  }

  getInMemoryAvgDuration(activeDurations: number[]): number {
    const all = [...this.recentDurations, ...activeDurations];
    if (all.length === 0) return 0;
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  }

  getTrackedCount(activeCount: number): number {
    return this.recentDurations.length + activeCount;
  }

  async getSessions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.prisma.visitorSession.findMany({
        orderBy: { connectedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.visitorSession.count(),
    ]);
    return {
      message: 'Visitor sessions retrieved successfully',
      data: { sessions, total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, avgResult, topPages, topReferrers] =
      await Promise.all([
        this.prisma.visitorSession.count(),
        this.prisma.visitorSession.count({
          where: { connectedAt: { gte: today } },
        }),
        this.prisma.visitorSession.aggregate({
          _avg: { durationSeconds: true },
        }),
        this.prisma.$queryRaw<{ page: string; visits: bigint }[]>`
          SELECT page, COUNT(*) AS visits
          FROM visitor_sessions
          WHERE page IS NOT NULL
          GROUP BY page
          ORDER BY visits DESC
          LIMIT 5
        `,
        this.prisma.$queryRaw<{ referrer: string; visits: bigint }[]>`
          SELECT referrer, COUNT(*) AS visits
          FROM visitor_sessions
          WHERE referrer IS NOT NULL
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT 5
        `,
      ]);

    return {
      message: 'Traffic stats retrieved successfully',
      data: {
        totalSessions: total,
        todaySessions: todayCount,
        avgDurationSeconds: Math.round(avgResult._avg.durationSeconds ?? 0),
        topPages: topPages.map((r) => ({
          page: r.page,
          visits: Number(r.visits),
        })),
        topReferrers: topReferrers.map((r) => ({
          referrer: r.referrer,
          visits: Number(r.visits),
        })),
      },
    };
  }
}
