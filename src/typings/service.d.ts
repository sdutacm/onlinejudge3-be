declare namespace defService {
  interface ServiceListOpt<F = string> {
    page?: number;
    offset?: number;
    limit?: number;
    order?: Array<[F, 'ASC' | 'DESC']>;
  }

  interface ServiceFullListOpt<F = string> {
    order?: Array<[F, 'ASC' | 'DESC']>;
  }
}
