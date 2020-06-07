type RemovePagination<T> = Omit<T, 'page' | 'offset' | 'limit' | 'order'>;

type TreatDateFieldsAsString<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string | null
    : T[P] extends Date | undefined
    ? string | undefined
    : T[P] extends Date | null | undefined
    ? string | null | undefined
    : T[P];
};
