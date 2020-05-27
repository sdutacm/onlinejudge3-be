type RemovePagination<T> = Omit<T, 'page' | 'offset' | 'limit' | 'order'>;
