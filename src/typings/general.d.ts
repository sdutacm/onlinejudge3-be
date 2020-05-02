interface IServiceListOpt<F> {
  offset?: number;
  limit?: number;
  order?: Array<[F, 'ASC' | 'DESC']>;
}

interface IServiceListFullOpt<F> {
  order?: Array<[F, 'ASC' | 'DESC']>;
}
