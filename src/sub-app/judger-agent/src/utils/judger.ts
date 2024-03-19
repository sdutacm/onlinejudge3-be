import path from 'path';
import fs from 'fs-extra';
import config from '../config';

export async function lsDataCases(problemId: number, extraHashDir?: string) {
  const dir = path.join(config.judgerData.dataDir, problemId.toString(), extraHashDir || '');
  const files = (await fs.readdir(dir)).filter((file) => /^data\d+\.(in|out)$/.test(file));
  const caseNumberSetTemp = new Set<number>();
  const caseNumberSet = new Set<number>();
  for (const file of files) {
    const regex = /data(\d+)\.(in|out)/;
    const caseNumber = +file.match(regex)?.[1];
    if (!caseNumber) {
      continue;
    }
    if (caseNumberSetTemp.has(caseNumber)) {
      caseNumberSet.add(caseNumber);
    } else {
      caseNumberSetTemp.add(caseNumber);
    }
  }
  const cases = Array.from(caseNumberSet).sort((a, b) => a - b);
  return cases.map((c) => ({ in: `data${c}.in`, out: `data${c}.out` }));
}
