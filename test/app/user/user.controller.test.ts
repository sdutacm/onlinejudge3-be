import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick, omit } from 'lodash';
import { EUserPermission, EUserForbidden } from '@/common/enums';
import { IMUserServiceGetListOpt } from '@/app/user/user.interface';

const commonUserDetailMap = {
  1: {
    userId: 1,
    username: 'root',
    nickname: 'hack',
    email: 'sdutacm@sdutacm.cn',
    verified: true,
    school: 'school',
    createdAt: '2020-08-01T16:00:00.000Z',
    submitted: 5,
    accepted: 2,
    defaultLanguage: 'g++',
    lastTime: '2020-08-01T16:00:00.000Z',
    permission: EUserPermission.admin,
    forbidden: EUserForbidden.normal,
    avatar: 'string',
    college: 'string',
    major: 'string',
    grade: 'grade',
    class: 'class',
    site: 'site',
    bannerImage: 'string',
    settings: {},
    coin: 0,
    rating: 0,
    ratingHistory: [],
  },
  2: {
    userId: 2,
    username: 'username',
    nickname: 'nickname',
    email: '1870893666@qq.com',
    verified: true,
    school: 'school',
    createdAt: '2020-08-01T16:00:00.000Z',
    submitted: 200,
    accepted: 100,
    defaultLanguage: 'python2',
    lastTime: '2020-08-01T16:00:00.000Z',
    permission: EUserPermission.normal,
    forbidden: EUserForbidden.normal,
    avatar: 'string',
    college: 'string',
    major: 'string',
    grade: 'grade',
    class: 'class',
    site: 'site',
    bannerImage: 'string',
    settings: {},
    coin: 1,
    rating: 1,
    ratingHistory: [
      {
        contest: {
          contestId: 1,
          title: 'title',
        },
        rank: 1,
        rating: 1,
        ratingChange: 1,
        date: '2020-01-01',
      },
    ],
  },
};

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.getSession), () => {
    const url = routesBe.getSession.url;

    it('should work with session', async () => {
      const session = testUtils.getMockNormalSession();
      app.mockContext({
        session,
      });
      await app
        .httpRequest()
        .get(url)
        .expect(200)
        .expect({
          success: true,
          data: pick(session, ['userId', 'username', 'nickname', 'permission', 'avatar']),
        });
    });

    it('should work without session', async () => {
      await app.httpRequest().get(url).expect(200).expect({
        success: true,
        data: null,
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.login), () => {
    const url = routesBe.login.url;

    it('should work with correct login info', async () => {
      const user = {
        userId: 1,
        username: 'root',
        nickname: 'hack',
        permission: 3,
        avatar: '',
      };
      app.mockClassFunction('userService', 'findOne', async () => user);
      const data = {
        loginName: 'user',
        password: 'pass',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: pick(user, ['userId', 'username', 'nickname', 'permission', 'avatar']),
        });
    });

    it('should work with incorrect login info', async () => {
      app.mockClassFunction('userService', 'findOne', async () => null);
      const data = {
        loginName: 'user',
        password: 'pass',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_LOGIN_INFO,
        msg: codeMsgs[Codes.USER_INCORRECT_LOGIN_INFO],
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.register), () => {
    const url = routesBe.register.url;

    it('should work with correct register info', async () => {
      const newId = 2;
      const verificationCode = {
        code: 213645,
        createdAt: '2020-08-01T16:00:00.000Z', // datetime str
      };
      app.mockClassFunction('userService', 'create', async () => newId);
      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => verificationCode,
      );
      const data = {
        username: 'username',
        nickname: 'nickname',
        email: '1870893666@qq.com',
        code: 213645,
        password: 'password',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { userId: newId },
        });
    });

    it('should work with existed username in register info', async () => {
      app.mockClassFunction('userService', 'isUsernameExists', async () => true);
      const data = {
        username: 'username',
        nickname: 'nickname',
        email: '1870893666@qq.com',
        code: 213645,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_USERNAME_EXISTS,
        msg: codeMsgs[Codes.USER_USERNAME_EXISTS],
      });
    });

    it('should work with existed nickname in register info', async () => {
      app.mockClassFunction('userService', 'isNicknameExists', async () => true);
      const data = {
        username: 'username',
        nickname: 'nickname',
        email: '1870893666@qq.com',
        code: 213645,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_NICKNAME_EXISTS,
        msg: codeMsgs[Codes.USER_NICKNAME_EXISTS],
      });
    });

    it('should work with existed email in register info', async () => {
      app.mockClassFunction('userService', 'isEmailExists', async () => true);
      const data = {
        username: 'username',
        nickname: 'nickname',
        email: '1870893666@qq.com',
        code: 213645,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_EMAIL_EXISTS,
        msg: codeMsgs[Codes.USER_EMAIL_EXISTS],
      });
    });

    it('should work with incorrect verificationCode in register info', async () => {
      const verificationCode = {
        code: 213666,
        createdAt: '2020-08-01T16:00:00.000Z', // datetime str
      };
      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => verificationCode,
      );
      const data = {
        username: 'username',
        nickname: 'nickname',
        email: '1870893666@qq.com',
        code: 213645,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_VERIFICATION_CODE,
        msg: codeMsgs[Codes.USER_INCORRECT_VERIFICATION_CODE],
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.getUserList), () => {
    const url = routesBe.getUserList.url;

    it('should work', async () => {
      const list = {
        count: 1,
        rows: [
          {
            userId: 2,
            username: 'username',
            nickname: 'nickname',
            submitted: 0,
            accepted: 0,
            avatar: null,
            bannerImage: '',
            rating: 0,
            grade: '',
            forbidden: EUserForbidden.normal,
          },
        ],
      };
      app.mockClassFunction('userService', 'getList', async () => list);

      const data = {
        page: 1,
        limit: 10,
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { page: 1, limit: 10, ...list },
        });
    });

    it('should work with forbidden field', async () => {
      app.mockContext({
        session: testUtils.getMockAdminSession(),
      });
      const list = {
        count: 1,
        rows: [
          {
            userId: 2,
            username: 'username',
            nickname: 'nickname',
            submitted: 0,
            accepted: 0,
            avatar: null,
            bannerImage: '',
            rating: 0,
            grade: '',
            forbidden: EUserForbidden.banned,
          },
        ],
      };
      app.mockClassFunction('userService', 'getList', async (options: IMUserServiceGetListOpt) => {
        if (options.forbidden === EUserForbidden.banned) {
          return list;
        }
        return { count: 0, rows: [] };
      });

      const data = {
        page: 1,
        limit: 10,
        forbidden: EUserForbidden.banned,
      };
      // 是 admin 的情况，允许 forbidden 字段
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { page: 1, limit: 10, ...list },
        });

      // 非 admin 的情况，不允许 forbidden 字段
      app.mockContext({
        session: testUtils.getMockNormalSession(),
      });
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { page: 1, limit: 10, count: 0, rows: [] },
        });
    });
  });

  describe(testUtils.controllerDesc(routesBe.getUserDetail), () => {
    const url = routesBe.getUserDetail.url;

    it('should work when checking others', async () => {
      const detail = commonUserDetailMap[2];
      app.mockClassFunction('userService', 'getDetail', async () => detail);

      const data = {
        userId: 2,
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: omit(detail, [
            'email',
            'defaultLanguage',
            'settings',
            'coin',
            'verified',
            'lastTime',
            'createdAt',
          ]),
        });
    });

    it('should work when checking self', async () => {
      const session = {
        userId: 2,
        username: 'username',
        nickname: 'nickname',
        permission: 0,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      const detail = commonUserDetailMap[2];
      app.mockClassFunction('userService', 'getDetail', async () => detail);

      const data = {
        userId: 2,
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...detail },
        });
    });
  });

  describe(testUtils.controllerDesc(routesBe.updateUserDetail), () => {
    const url = routesBe.updateUserDetail.url;

    it('should work when updating self', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: 0,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('userService', 'update', async () => true);
      app.mockClassFunction('userService', 'clearDetailCache', async () => {});

      const data = {
        userId: 1,
        school: 'school',
        college: 'string',
        major: 'string',
        class: 'string',
        site: '',
        defaultLanguage: 'python3',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });

    it('should work when updating others', async () => {
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);

      const data = {
        userId: 2,
        school: 'school',
        college: 'string',
        major: 'string',
        class: 'string',
        site: '',
        defaultLanguage: 'python3',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.GENERAL_NO_PERMISSION,
        msg: codeMsgs[Codes.GENERAL_NO_PERMISSION],
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.updateUserPassword), () => {
    const url = routesBe.updateUserPassword.url;

    it('should work with correct old pwd when logged', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: 0,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('userService', 'isExists', async () => true);
      app.mockClassFunction('userService', 'update', async () => true);

      const data = {
        userId: 1,
        oldPassword: 'olderPwd',
        password: 'newPwd',
      };
      await app.httpRequest().post(url).send(data).expect({ success: true });
    });

    it('should work with incorrect old pwd when logged', async () => {
      app.mockClassFunction('userService', 'update', async () => 0);
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: 0,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('userService', 'isExists', async () => false);
      const data = {
        userId: 1,
        oldPassword: 'oldPwd',
        password: 'newPwd',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_OLD_PASSWORD,
        msg: codeMsgs[Codes.USER_INCORRECT_OLD_PASSWORD],
      });
    });

    it('should work with correct old pwd when not logged', async () => {
      const data = {
        userId: 2,
        oldPassword: 'olderPwd',
        password: 'newPwd',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.GENERAL_NO_PERMISSION,
        msg: codeMsgs[Codes.GENERAL_NO_PERMISSION],
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.resetUserPassword), () => {
    const url = routesBe.resetUserPassword.url;

    it('should work with correct verified code', async () => {
      const user = {
        email: '1870893666@qq.com',
        userId: 1,
      };
      const code = {
        code: 312658,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('userService', 'findOne', async () => user);
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      app.mockClassFunction('userService', 'update', async () => true);
      app.mockClassFunction('verificationService', 'deleteEmailVerificationCode', async () => {});
      const data = {
        email: '1870893666@qq.com',
        code: 312658,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });

    it('should work with incorrect user info', async () => {
      const code = {
        code: 312658,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('userService', 'findOne', async () => null);
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      const data = {
        email: '1870893666@qq.com',
        code: 312658,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_NOT_EXIST,
        msg: codeMsgs[Codes.USER_NOT_EXIST],
      });
    });

    it('should work with incorrect verified code', async () => {
      const user = {
        email: '1870893666@qq.com',
        userId: 1,
        verified: false,
      };
      const code = {
        code: 312658,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('userService', 'findOne', async () => user);
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      const data = {
        email: '1870893666@qq.com',
        code: 312558,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_VERIFICATION_CODE,
        msg: codeMsgs[Codes.USER_INCORRECT_VERIFICATION_CODE],
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.resetUserPasswordByAdmin), () => {
    const url = routesBe.resetUserPasswordByAdmin.url;

    it('should work with admin', async () => {
      app.mockContext({
        session: testUtils.getMockAdminSession(),
      });

      app.mockClassFunction('userService', 'update', async () => true);
      const data = {
        userId: 1,
        password: 'password',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.updateUserEmail), () => {
    const url = routesBe.updateUserEmail.url;

    it('should work with correct verified code with new email', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.normal,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });

      const code = {
        code: 312658,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      app.mockClassFunction('userService', 'isEmailExists', async () => false);
      app.mockClassFunction('userService', 'update', async () => null);
      app.mockClassFunction('userService', 'clearDetailCache', async () => {});
      app.mockClassFunction('verificationService', 'deleteEmailVerificationCode', async () => {});
      const data = {
        userId: 1,
        email: '1870893666@qq.com',
        code: 312658,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });

    it('should work with correct verified code with existed email', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.normal,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });

      const code = {
        code: 312658,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      app.mockClassFunction('userService', 'isEmailExists', async () => true);
      const data = {
        userId: 1,
        email: '1870893666@qq.com',
        code: 312658,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_EMAIL_EXISTS,
        msg: codeMsgs[Codes.USER_EMAIL_EXISTS],
      });
    });

    it('should work with incorrect verified code', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.normal,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });

      const code = {
        code: 312668,
        createdAt: '2020-08-02T16:00:00.000Z',
      };
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => code);
      const data = {
        userId: 1,
        email: '1870893666@qq.com',
        code: 312658,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_VERIFICATION_CODE,
        msg: codeMsgs[Codes.USER_INCORRECT_VERIFICATION_CODE],
      });
    });
  });
  // /////////////////////////uploadUserAvatar
  // describe(testUtils.controllerDesc(routesBe.uploadUserAvatar), () => {
  //   const url = routesBe.uploadUserAvatar.url;

  //   it('should work with ', async () => {
  //     const session = {
  //       userId: 1,
  //       username: 'test',
  //       nickname: 'nick',
  //       permission: EUserPermission.admin,
  //       avatar: '',
  //       contests: {},
  //     };
  //     app.mockContext({
  //       session,
  //     });
  //     const detail = {
  //       userId: 2,
  //       username: 'username',
  //       nickname: 'nickname',
  //       email: '1870893666@qq.com',
  //       verified: 1,
  //       password: 'qwer123',
  //       school: 'school',
  //       createdAt: '2020-08-01T16:00:00.000Z',
  //       submitted: 200,
  //       accepted: 100,
  //       defaultLanguage: 'string',
  //       lastIp: 'string',
  //       lastTime: '2020-08-01T16:00:00.000Z',
  //       permission: 100,
  //       forbidden: 10,
  //       avatar: 'string',
  //       college: 'string',
  //       major: 'string',
  //       grade: 'grade',
  //       class: 'class',
  //       site: 'site',
  //       bannerImage: 'string',
  //       settings: {},
  //       coin: 1,
  //       rating: 1,
  //           ratingHistory:
  //       [ {
  //               contest: {
  //                 contestId: 1,
  //                 title: 'title',
  //               },
  //               rank: 1,
  //               rating: 1,
  //               ratingChange: 1,
  //               date: 'data',
  //       }],
  //     };
  //     app.mockClassFunction('userService', 'getDetail', async () => detail);
  //     const data = {

  //     };
  //     await app.httpRequest().post(url).send(data).expect({
  //       success: true,
  //     });
  //   });

  // });
  // /////////////////////////uploadUserBannerImage
  // describe(testUtils.controllerDesc(routesBe.uploadUserBannerImage), () => {
  //   const url = routesBe.uploadUserBannerImage.url;

  //   it('should work with ', async () => {
  //     const session = {
  //       userId: 1,
  //       username: 'test',
  //       nickname: 'nick',
  //       permission: EUserPermission.admin,
  //       avatar: '',
  //       contests: {},
  //     };
  //     app.mockContext({
  //       session,
  //     });
  //     const detail = {
  //       userId: 2,
  //       username: 'username',
  //       nickname: 'nickname',
  //       email: '1870893666@qq.com',
  //       verified: 1,
  //       password: 'qwer123',
  //       school: 'school',
  //       createdAt: '2020-08-01T16:00:00.000Z',
  //       submitted: 200,
  //       accepted: 100,
  //       defaultLanguage: 'string',
  //       lastIp: 'string',
  //       lastTime: '2020-08-01T16:00:00.000Z',
  //       permission: 100,
  //       forbidden: 10,
  //       avatar: 'string',
  //       college: 'string',
  //       major: 'string',
  //       grade: 'grade',
  //       class: 'class',
  //       site: 'site',
  //       bannerImage: 'string',
  //       settings: {},
  //       coin: 1,
  //       rating: 1,
  //           ratingHistory:
  //       [ {
  //               contest: {
  //                 contestId: 1,
  //                 title: 'title',
  //               },
  //               rank: 1,
  //               rating: 1,
  //               ratingChange: 1,
  //               date: 'data',
  //       }],
  //     };
  //     app.mockClassFunction('userService', 'getDetail', async () => detail);
  //     const data = {

  //     };
  //     await app.httpRequest().post(url).send(data).expect({
  //       success: true,
  //     });
  //   });

  // });
  /////////////////////////
  describe(testUtils.controllerDesc(routesBe.getUserProblemResultStats), () => {
    const url = routesBe.getUserProblemResultStats.url;

    it('should work with contestId ', async () => {
      const re = {
        acceptedProblemIds: [1, 2, 3],
        attemptedProblemIds: [1, 2, 3],
      };
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('solutionService', 'getUserProblemResultStats', async () => re);

      const data = {
        userId: 1,
        contestId: 1,
      };

      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...re },
        });
    });

    it('should work without contestId ', async () => {
      const re = {
        acceptedProblemIds: [1, 2, 3],
        attemptedProblemIds: [1, 2, 3],
      };
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('solutionService', 'getUserProblemResultStats', async () => re);

      const data = {
        userId: 1,
      };

      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...re },
        });
    });
  });
  /////////////////////////
  describe(testUtils.controllerDesc(routesBe.getUserSolutionCalendar), () => {
    const url = routesBe.getUserSolutionCalendar.url;

    it('should work with correct info ', async () => {
      const re = [
        {
          date: '2020-08-11', // YYYY-MM-DD
          count: 3,
        },
      ];
      app.mockClassFunction('userService', 'getDetail', async () => commonUserDetailMap[1]);
      app.mockClassFunction('solutionService', 'getUserSolutionCalendar', async () => re);

      const data = {
        userId: 1,
        result: 1,
      };

      await app.httpRequest().post(url).send(data).expect({
        success: true,
        data: re,
      });
    });
  });
});
