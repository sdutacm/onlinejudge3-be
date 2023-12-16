import { IUserModel, IUserModelRatingHistory } from '../user/user.interface';
import {
  EContestType,
  EContestCategory,
  EContestMode,
  EContestUserStatus,
  EContestRatingStatus,
} from '@/common/enums';
import { IMProblemDetail } from '../problem/problem.interface';

//#region contest model
export interface IContestModel {
  contestId: number;
  title: string;
  description: string;
  intro: string;
  type: EContestType;
  category: EContestCategory;
  mode: EContestMode;
  password: string;
  author: number;
  startAt: Date;
  endAt: Date;
  frozenLength: number;
  registerStartAt: Date | null;
  registerEndAt: Date | null;
  team: boolean;
  ended: boolean;
  hidden: boolean;
}

export type TContestModelFields = keyof IContestModel;

export type TMContestLiteFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'startAt'
  | 'endAt'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'hidden'
>;

export type TMContestDetailFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'intro'
  | 'description'
  | 'password'
  | 'startAt'
  | 'endAt'
  | 'frozenLength'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'ended'
  | 'hidden'
>;

export type IMContestLite = Pick<IContestModel, TMContestLiteFields>;
export type IMContestDetail = Pick<IContestModel, TMContestDetailFields>;
export type IMContestListPagination = defService.ServiceListOpt<TContestModelFields>;
export type IMContestRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
>;
//#endregion

//#region contest problem model
export interface IContestProblemModel {
  contestId: number;
  problemId: number;
  title: string;
  index: number;
}

export type TContestProblemModelFields = keyof IContestProblemModel;

export type TMContestProblemDetailFields = Extract<
  TContestProblemModelFields,
  'problemId' | 'title'
>;

export type IMContestProblemLite = Pick<IContestProblemModel, TMContestProblemDetailFields>;

export type IMContestProblemDetail = Pick<IContestProblemModel, TMContestProblemDetailFields> &
  Omit<IMProblemDetail, 'tags'>;
//#endregion

//#region contest user model
export interface IContestUserModel {
  contestUserId: number;
  contestId: number;
  username: string;
  nickname: string;
  subname: string;
  avatar: string;
  status: EContestUserStatus;
  unofficial: boolean;
  password: string;
  sitNo: string | null;
  schoolNo1: string;
  name1: string;
  school1: string;
  college1: string;
  major1: string;
  class1: string;
  tel1: string;
  email1: string;
  clothing1: string;
  schoolNo2: string;
  name2: string;
  school2: string;
  college2: string;
  major2: string;
  class2: string;
  tel2: string;
  email2: string;
  clothing2: string;
  schoolNo3: string;
  name3: string;
  school3: string;
  college3: string;
  major3: string;
  class3: string;
  tel3: string;
  email3: string;
  clothing3: string;
  createdAt: Date | null;
}

export type TContestUserModelFields = keyof IContestUserModel;

export type TMContestUserLiteFields = Extract<
  TContestUserModelFields,
  | 'contestUserId'
  | 'contestId'
  | 'username'
  | 'nickname'
  | 'subname'
  | 'avatar'
  | 'status'
  | 'unofficial'
  | 'name1'
  | 'school1'
  | 'college1'
  | 'major1'
  | 'class1'
  | 'name2'
  | 'school2'
  | 'college2'
  | 'major2'
  | 'class2'
  | 'name3'
  | 'school3'
  | 'college3'
  | 'major3'
  | 'class3'
  | 'createdAt'
>;

export type TMContestUserDetailFields = Extract<
  TContestUserModelFields,
  | 'contestUserId'
  | 'contestId'
  | 'username'
  | 'nickname'
  | 'subname'
  | 'avatar'
  | 'status'
  | 'unofficial'
  | 'password'
  | 'sitNo'
  | 'schoolNo1'
  | 'name1'
  | 'school1'
  | 'college1'
  | 'major1'
  | 'class1'
  | 'tel1'
  | 'email1'
  | 'clothing1'
  | 'schoolNo2'
  | 'name2'
  | 'school2'
  | 'college2'
  | 'major2'
  | 'class2'
  | 'tel2'
  | 'email2'
  | 'clothing2'
  | 'schoolNo3'
  | 'name3'
  | 'school3'
  | 'college3'
  | 'major3'
  | 'class3'
  | 'tel3'
  | 'email3'
  | 'clothing3'
  | 'createdAt'
>;

export interface IMContestUserLite {
  contestUserId: IContestUserModel['contestUserId'];
  contestId: IContestUserModel['contestId'];
  username: IContestUserModel['username'];
  nickname: IContestUserModel['nickname'];
  subname: IContestUserModel['subname'];
  avatar: IContestUserModel['avatar'];
  status: IContestUserModel['status'];
  unofficial: IContestUserModel['unofficial'];
  members: Array<{
    name: string;
    school: string;
    college: string;
    major: string;
    class: string;
  }>;
  createdAt: IContestUserModel['createdAt'];
}
export interface IMContestUserDetailPlain {
  contestUserId: IContestUserModel['contestUserId'];
  contestId: IContestUserModel['contestId'];
  username: IContestUserModel['username'];
  nickname: IContestUserModel['nickname'];
  subname: IContestUserModel['subname'];
  avatar: IContestUserModel['avatar'];
  status: IContestUserModel['status'];
  unofficial: IContestUserModel['unofficial'];
  password: IContestUserModel['password'];
  sitNo: IContestUserModel['sitNo'];
  members: Array<{
    schoolNo: string;
    name: string;
    school: string;
    college: string;
    major: string;
    class: string;
    tel: string;
    email: string;
    clothing: string;
  }>;
  createdAt: IContestUserModel['createdAt'];
}
export type IMContestUserDetail = IMContestUserDetailPlain & {
  globalUserId?: IUserModel['userId'];
  rating?: IUserModel['rating'];
};
export type IMContestUserListPagination = defService.ServiceListOpt<TContestUserModelFields>;
//#endregion

//#region contest problem model
export interface IRatingContestModel {
  contestId: number | null;
  competitionId: number | null;
  ratingUntil: Record<
    IUserModel['userId'],
    {
      rating: number;
      ratingHistory: IUserModelRatingHistory;
    }
  >;
  ratingChange: Record<
    IUserModel['userId'],
    {
      oldRating: number;
      newRating: number;
      rank: number;
      ratingChange: number;
    }
  >;
  createdAt: Date;
  updatedAt: Date;
}

export type TRatingContestModelFields = keyof IRatingContestModel;

export type TMContestRatingContestDetailFields = Extract<
  TRatingContestModelFields,
  'contestId' | 'competitionId' | 'ratingUntil' | 'ratingChange' | 'createdAt' | 'updatedAt'
>;

export type IMContestRatingContestDetail = Pick<
  IRatingContestModel,
  TMContestRatingContestDetailFields
>;
//#endregion

//#region ranklist
export interface IMContestRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'RJ' | '?' | null; // 结果。'?' 表示封榜后有新提交，null 表示未提交
  tries: number; // 尝试次数。首次 AC 的那次提交也计入
  time: number; // AC 时的时间。单位为 s
  score?: number; // 得分
}

export interface IMContestRanklistRow {
  rank: number; // 排名。solved 和 time 都相等时 rank 并列
  user: IMContestRelativeUser & {
    globalUserId?: number;
    oldRating?: number;
    newRating?: number;
  };
  score: number;
  time: number; // s
  stats: IMContestRanklistProblemResultStat[];
}

export type IMContestRanklist = IMContestRanklistRow[];
//#endregion

//#region rating status
export interface IMContestRatingStatus {
  status: EContestRatingStatus;
  progress?: number; // 进度
  used?: number; // 完成耗时
}
//#endregion

//#region rank data
export interface IMContestRankDataItem {
  rank: IMContestRanklistRow['rank'];
  userId: IUserModel['userId'];
  username: IUserModel['username'];
  contestUserId: IContestUserModel['contestUserId'];
}

export type IMContestRankData = IMContestRankDataItem[];
//#endregion

//#region service.getList
export interface IMContestServiceGetListOpt {
  contestId?: IContestModel['contestId'];
  contestIds?: IContestModel['contestId'][];
  title?: IContestModel['title'];
  type?: IContestModel['type'];
  category?: IContestModel['category'];
  mode?: IContestModel['mode'];
  hidden?: IContestModel['hidden'];
  userId?: IUserModel['userId'];
}

export type IMContestServiceGetListRes = defModel.ListModelRes<IMContestLite>;
//#endregion

//#region service.getDetail
export type IMContestServiceGetDetailRes = defModel.DetailModelRes<IMContestDetail>;
//#endregion

//#region service.getRelative
export type IMContestServiceGetRelativeRes = Record<IContestModel['contestId'], IMContestDetail>;
//#endregion

//#region service.findOne
export type IMContestServiceFindOneOpt = Partial<IContestModel>;
export type IMContestServiceFindOneRes = defModel.DetailModelRes<IMContestDetail>;
//#endregion

//#region service.isExists
export type IMContestServiceIsExistsOpt = Partial<IContestModel>;
//#endregion

//#region service.create
export interface IMContestServiceCreateOpt {
  title: IContestModel['title'];
  description: IContestModel['description'];
  intro?: IContestModel['intro'];
  type: IContestModel['type'];
  category: IContestModel['category'];
  mode: IContestModel['mode'];
  password?: IContestModel['password'];
  author: IContestModel['author'];
  startAt: IContestModel['startAt'] | string;
  endAt: IContestModel['endAt'] | string;
  frozenLength?: IContestModel['frozenLength'];
  registerStartAt?: IContestModel['registerStartAt'] | string;
  registerEndAt?: IContestModel['registerEndAt'] | string;
  team?: IContestModel['team'];
  ended?: IContestModel['ended'];
  hidden?: IContestModel['hidden'];
}

export type IMContestServiceCreateRes = IContestModel['contestId'];
//#endregion

//#region service.update
export interface IMContestServiceUpdateOpt {
  title?: IContestModel['title'];
  description?: IContestModel['description'];
  intro?: IContestModel['intro'];
  type?: IContestModel['type'];
  category?: IContestModel['category'];
  mode?: IContestModel['mode'];
  password?: IContestModel['password'];
  author?: IContestModel['author'];
  startAt?: IContestModel['startAt'] | string;
  endAt?: IContestModel['endAt'] | string;
  frozenLength?: IContestModel['frozenLength'];
  registerStartAt?: IContestModel['registerStartAt'] | string;
  registerEndAt?: IContestModel['registerEndAt'] | string;
  team?: IContestModel['team'];
  ended?: IContestModel['ended'];
  hidden?: IContestModel['hidden'];
}

export type IMContestServiceUpdateRes = boolean;
//#endregion

//#region service.getUserContests
export type IMContestServiceGetUserContestsRes = defModel.FullListModelRes<
  IContestModel['contestId']
>;
//#endregion

//#region service.getContestProblems
export type IMContestServiceGetContestProblemsRes = defModel.FullListModelRes<
  IMContestProblemDetail
>;
//#endregion

//#region service.getContestProblemConfig
export type IMContestServiceGetContestProblemConfigRes = defModel.FullListModelRes<
  IMContestProblemLite
>;
//#endregion

//#region service.setContestProblems
export type IMContestServiceSetContestProblemsOpt = Array<{
  problemId: IContestProblemModel['problemId'];
  title: IContestProblemModel['title'];
}>;
//#endregion

//#region service.getContestUserList
export interface IMContestServiceGetContestUserListOpt {
  contestUserId?: IContestUserModel['contestUserId'];
  username?: IContestUserModel['username'];
  nickname?: IContestUserModel['nickname'];
}

export type IMContestServiceGetContestUserListRes = defModel.ListModelRes<IMContestUserLite>;
//#endregion

//#region service.getContestUsers
export interface IMContestServiceGetContestUsersOpt {
  status?: IContestUserModel['status'];
}

export type IMContestServiceGetContestUsersRes = defModel.ListModelRes<IMContestUserDetail>;
//#endregion

//#region service.getContestUserDetail
export type IMContestServiceGetContestUserDetailRes = defModel.DetailModelRes<IMContestUserDetail>;
//#endregion

//#region service.getRelativeContestUser
export type IMContestServiceGetRelativeContestUserRes = Record<
  IContestUserModel['contestUserId'],
  IMContestUserDetail
>;
//#endregion

//#region service.findOneContestUser
export type IMContestServiceFindOneContestUserOpt = Partial<IContestUserModel>;
export type IMContestServiceFindOneContestUserRes = defModel.DetailModelRes<IMContestUserDetail>;
//#endregion

//#region service.isContestUserExists
export type IMContestServiceIsContestUserExistsOpt = Partial<IContestUserModel>;
//#endregion

//#region service.createContestUser
export interface IMContestServiceCreateContestUserOpt {
  username: IContestUserModel['username'];
  nickname: IContestUserModel['nickname'];
  subname?: IContestUserModel['subname'];
  status?: IContestUserModel['status'];
  sitNo?: IContestUserModel['sitNo'];
  unofficial: IContestUserModel['unofficial'];
  password: IContestUserModel['password'];
  members: Array<{
    schoolNo?: string;
    name: string;
    school: string;
    college?: string;
    major?: string;
    class?: string;
    tel: string;
    email: string;
    clothing?: string;
  }>;
}

export type IMContestServiceCreateContestUserRes = IContestUserModel['contestUserId'];
//#endregion

//#region service.updateContestUser
export interface IMContestServiceUpdateContestUserOpt {
  nickname?: IContestUserModel['nickname'];
  subname?: IContestUserModel['subname'];
  status?: IContestUserModel['status'];
  sitNo?: IContestUserModel['sitNo'];
  unofficial?: IContestUserModel['unofficial'];
  password?: IContestUserModel['password'];
  members?: Array<{
    schoolNo?: string;
    name: string;
    school: string;
    college?: string;
    major?: string;
    class?: string;
    tel: string;
    email: string;
    clothing?: string;
  }>;
}

export type IMContestServiceUpdateContestUserRes = boolean;
//#endregion

//#region service.getRanklist
export type IMContestServiceGetRanklistRes = defModel.FullListModelRes<IMContestRanklistRow>;
//#endregion

//#region service.getRatingStatus
export type IMContestServiceGetRatingStatusRes = IMContestRatingStatus | null;
//#endregion

//#region service.getRatingContestDetail
export type IMContestServiceGetRatingContestDetailRes = IMContestRatingContestDetail | null;
//#endregion
