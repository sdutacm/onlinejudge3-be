export const roomKey = {
  user(userId: number) {
    return `user:${userId}`;
  },
  judgeStatus(solutionId: number) {
    return `solution:${solutionId}`;
  },
  competition(competitionId: number) {
    return `competition:${competitionId}`;
  },
  competitionUser(competitionId: number, userId: number) {
    return `competition:${competitionId}_${userId}`;
  },
};
