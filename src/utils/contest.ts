export function isContestSolutionInFrozen(
  solution: { createdAt: Date | string },
  contest: { endAt: Date | string },
  frozenLength = 0,
) {
  const solutionCreatedAt =
    solution.createdAt instanceof Date ? solution.createdAt : new Date(solution.createdAt);
  const contestEndAt = contest.endAt instanceof Date ? contest.endAt : new Date(contest.endAt);
  const frozenStart = new Date(contestEndAt.getTime() - frozenLength * 1000);
  return frozenStart <= solutionCreatedAt;
}
