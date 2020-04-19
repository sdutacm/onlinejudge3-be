declare namespace defModel {
  interface ListModelRes<T> {
    count: number;
    rows: T[];
  }

  type DetailModelRes<T> = T | null;
}
