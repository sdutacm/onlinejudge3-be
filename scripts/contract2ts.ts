import path from 'path';
import fs from 'fs-extra';
import prettierConfig from '../.prettierrc.js';
import { upperFirst } from 'lodash';
import { compile } from 'json-schema-to-typescript';
import userContract from '../src/app/user/user.contract';
import verificationContract from '../src/app/verification/verification.contract';
import problemContract from '../src/app/problem/problem.contract';
import tagContract from '../src/app/tag/tag.contract';

// 新增 contract 配置在这里
// [contractObject, filename]
const contracts = [
  [userContract, 'user'],
  [verificationContract, 'verification'],
  [problemContract, 'problem'],
  [tagContract, 'tag'],
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
