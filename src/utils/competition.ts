export function isCompetitionSolutionInFrozen(
  solution: { createdAt: Date | string },
  competition: { endAt: Date | string },
  frozenLength: number = 0,
) {
  const solutionCreatedAt =
    solution.createdAt instanceof Date ? solution.createdAt : new Date(solution.createdAt);
  const competitionEndAt =
    competition.endAt instanceof Date ? competition.endAt : new Date(competition.endAt);
  const frozenStart = new Date(competitionEndAt.getTime() - frozenLength * 1000);
  return frozenStart <= solutionCreatedAt;
}
