export enum ECompetitionRulePreset {
  ICPC = 'ICPC',
  ICPCWithScore = 'ICPCWithScore',
}

export enum ECompetitionSettingAllowedJoinMethod {
  Register = 'register',
  Public = 'public',
  Password = 'password',
}

export enum ECompetitionSettingAllowedAuthMethod {
  Session = 'session',
  Password = 'password',
  IP = 'ip',
  Assistant = 'assistant',
}

export enum ECompetitionLogAction {
  Login = 'Login',
  Logout = 'Logout',
  SignUp = 'SignUp',
  ModifySelfParticipantInfo = 'ModifySelfParticipantInfo',
  DeleteSelfParticipantInfo = 'DeleteSelfParticipantInfo',
  AuditParticipant = 'AuditParticipant',
  ConfirmEnter = 'ConfirmEnter',
  ConfirmQuit = 'ConfirmQuit',
  UpdateDetail = 'UpdateDetail',
  UpdateSettings = 'UpdateSettings',
  UpdateProblemConfig = 'UpdateProblemConfig',
  SubmitSolution = 'SubmitSolution',
  RejudgeSolution = 'RejudgeSolution',
  BatchCreateUser = 'BatchCreateUser',
  CreateUser = 'CreateUser',
  UpdateUser = 'UpdateUser',
  RequestPassword = 'RequestPassword',
  RandomAllUserPasswords = 'RandomAllUserPasswords',
  CreateNotification = 'CreateNotification',
  SpGenshinExplorationUnlock = 'SpGenshinExplorationUnlock',
}

export enum ECompetitionEvent {
  SubmitSolution = 'solution:SubmitSolution',
  RejudgeSolution = 'solution:RejudgeSolution',
  JudgeStart = 'solution:JudgeStart',
  JudgeProgress = 'solution:JudgeProgress',
  JudgeFinish = 'solution:JudgeFinish',
  JudgeCancel = 'solution:JudgeCancel',
  SolutionResultSettle = 'solution:SolutionResultSettle',
  SolutionResultChange = 'solution:SolutionResultChange',
}
