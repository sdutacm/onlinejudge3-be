export interface IDataReleaseResult {
  extraHash: string;
  cases: Array<{ in: string; out: string }>;
  ts: number;
}
