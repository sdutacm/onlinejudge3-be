declare namespace model {
  interface ListModel<T> {
    count: number;
    rows: T[];
  }

  type DetailModel<T> = T | null;
}
