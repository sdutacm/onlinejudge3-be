const redisKey = {
  userDetail: 'cache:user_detail:%d',
  userProblemResultStats: 'cache:user_problem_result_stats:%d',
  userSolutionCalendar: 'cache:user_solution_calendar:%d_%d',
  userGroups: 'cache:user_groups:%d',
  problemDetail: 'cache:problem_detail:%d',
  solutionDetail: 'cache:solution_detail:%d',
  contestDetail: 'cache:contest_detail:%d',
  contestProblems: 'cache:contest_problems:%d',
  contestProblemResultStats: 'cache:contest_problem_result_stats:%d',
  contestRanklist: 'cache:contest_ranklist:%d_%d',
  contestUserDetail: 'cache:contest_user_detail:%d',
  userContests: 'cache:user_contests:%d',
  topicDetail: 'cache:topic_detail:%d',
  postDetail: 'cache:post_detail:%d',
  tagList: 'cache:tag_list',
  problemTags: 'cache:problem_tags:%d',
  setDetail: 'cache:set_detail:%d',
  groupDetail: 'cache:group_detail:%s',
  groupMemberList: 'cache:group_member_list:%s',
  ratingContestDetail: 'cache:rating_contest_detail:%d',
  judgerLanguageConfig: 'cache:judger_language_config',
  verificationCode: 'verification:code:%s',
  recordUserUpload: 'record:user_upload:%d',
  recordUserCreateGroup: 'record:user_create_group:%d',
  userACStats: 'stats:user_ac:%s',
  userASProblemsStatsRunInfo: 'stats:user_a_s_problems_run_info',
  userAcceptedProblemsStats: 'stats:user_accepted_problems:%d',
  userSubmittedProblemsStats: 'stats:user_submitted_problems:%d',
  contestRankData: 'temp:contest_rank_data:%d',
  solutionJudgeStatus: 'status:solution_judge_status:%d',
  contestRatingStatus: 'status:contest_rating_status:%d',
  rateIp: 'rateIp:%s:%s', // {interfaceName} {ip}
  rateUser: 'rateUser:%s:%d', // {interfaceName} {userId}
};

export default redisKey;
export type IRedisKeyConfig = typeof redisKey;
