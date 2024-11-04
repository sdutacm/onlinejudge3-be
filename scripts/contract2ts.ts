import path from 'path';
import fs from 'fs-extra';
import prettierConfig from '../.prettierrc.js';
import { upperFirst } from 'lodash';
import { compile } from 'json-schema-to-typescript';
import userContract from '../src/app/user/user.contract';
import verificationContract from '../src/app/verification/verification.contract';
import problemContract from '../src/app/problem/problem.contract';
import tagContract from '../src/app/tag/tag.contract';
import solutionContract from '../src/app/solution/solution.contract';
import contestContract from '../src/app/contest/contest.contract';
import judgerContract from '../src/app/judger/judger.contract';
import messageContract from '../src/app/message/message.contract';
import favoriteContract from '../src/app/favorite/favorite.contract';
import noteContract from '../src/app/note/note.contract';
import topicContract from '../src/app/topic/topic.contract';
import replyContract from '../src/app/reply/reply.contract';
import postContract from '../src/app/post/post.contract';
import setContract from '../src/app/set/set.contract';
import groupContract from '../src/app/group/group.contract';
import miscContract from '../src/app/misc/misc.contract';
import statContract from '../src/app/stat/stat.contract';
import fieldContract from '../src/app/field/field.contract';
import competitionContract from '../src/app/competition/competition.contract';
import balloonContract from '../src/app/balloon/balloon.contract';
import achievementContract from '../src/app/achievement/achievement.contract';

// 新增 contract 配置在这里
// [contractObject, filename]
const contracts = [
  [userContract, 'user'],
  [verificationContract, 'verification'],
  [problemContract, 'problem'],
  [tagContract, 'tag'],
  [solutionContract, 'solution'],
  [contestContract, 'contest'],
  [judgerContract, 'judger'],
  [messageContract, 'message'],
  [favoriteContract, 'favorite'],
  [noteContract, 'note'],
  [topicContract, 'topic'],
  [replyContract, 'reply'],
  [postContract, 'post'],
  [setContract, 'set'],
  [groupContract, 'group'],
  [miscContract, 'misc'],
  [statContract, 'stat'],
  [fieldContract, 'field'],
  [competitionContract, 'competition'],
  [balloonContract, 'balloon'],
  [achievementContract, 'achievement'],
];

const banner = `/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source contract file,
 * and run \`npm run gen:contract\` in "onlinejudge3-be" to regenerate this file.
 */
`;

const dest = path.join(__dirname, '../src/common/contracts/');

function compileContract(contract: any, filename: string) {
  const filePath = path.join(dest, `${filename}.ts`);
  fs.writeFileSync(filePath, banner);
  Object.keys(contract).forEach(async (name: string) => {
    const schema = contract[name];
    const ts = await compile(schema, `I${upperFirst(name)}`, {
      bannerComment: '',
      // @ts-ignore
      style: prettierConfig,
    });
    fs.appendFileSync(filePath, '\n' + ts);
  });
}

export default function compileAllContracts() {
  contracts.forEach((c: any) => compileContract(c[0], c[1]));
}

if (process.env.IS_EXEC_FROM_PKG_SCRIPT) {
  compileAllContracts();
}
