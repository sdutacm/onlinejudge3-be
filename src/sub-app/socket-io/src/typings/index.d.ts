import 'egg';
import type { Socket } from 'socket.io';

declare module 'egg' {
  interface Context {
    socket: Socket;
    session: {
      userId: number;
      username: string;
      nickname: string;
      permission: number;
      avatar: string | null;
      loginUa: string;
      loginIp: string;
      loginAt: string;
      lastAccessIp: string;
      lastAccessAt: string;
      contests: {
        [x: number]:
          | {
              userId: number;
              username: string;
              nickname: string;
              permission: number;
              avatar: string | null;
            }
          | undefined;
      };
      competitions: {
        [x: number]:
          | {
              // global OJ account info
              userId: number;
              // competition user info
              nickname: string;
              subname: string;
              role: ECompetitionUserRole;
            }
          | undefined;
      };
    };
  }
}
