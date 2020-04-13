export default {
  /**
   * 格式化为成功返回
   * @param data
   */
  rSuc(data?: any) {
    return {
      success: true,
      code: 0,
      data,
    };
  },

  /**
   * 格式化为失败返回
   * @param code
   * @param data
   */
  rFail(code: number, data?: any) {
    return {
      success: false,
      code,
      msg: 'N/A',
      data,
    };
  },

  /**
   * 格式化为带分页的列表的返回
   * @param page
   * @param limit
   * @param count
   * @param rows
   */
  rList({
    page = 0,
    limit = 0,
    count = 0,
    rows = [],
  }: {
    page: number;
    limit: number;
    count: number;
    rows: any[];
  }) {
    return {
      success: true,
      data: {
        page,
        limit,
        count,
        rows,
      },
    };
  },

  /**
   * 格式化为不带分页的完整列表的返回
   * @param count
   * @param rows
   */
  rFullList({ count = 0, rows = [] }: { count: number; rows: any[] }) {
    return {
      success: true,
      data: {
        count,
        rows,
      },
    };
  },
};
