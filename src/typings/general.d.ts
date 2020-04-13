interface IServiceListOpts<F> {
  offset?: number;
  limit?: number;
  order?: Array<[F, 'ASC' | 'DESC']>;
}

interface IServiceListFullOpts<F> {
  order?: Array<[F, 'ASC' | 'DESC']>;
}
