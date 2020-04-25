import { basename } from 'path';
import * as assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';

describe(basename(__filename), () => {
  it('should rSuc work', async () => {
    const ctx = app.mockContext();
    assert.deepStrictEqual(ctx.helper.rSuc(), { success: true, data: undefined });
    assert.deepStrictEqual(ctx.helper.rSuc(1), { success: true, data: 1 });
    assert.deepStrictEqual(ctx.helper.rSuc('test method'), { success: true, data: 'test method' });
    assert.deepStrictEqual(ctx.helper.rSuc({ test: '5' }), { success: true, data: { test: '5' } });
    assert.deepStrictEqual(ctx.helper.rSuc(['a', 5, { b: 10 }]), {
      success: true,
      data: ['a', 5, { b: 10 }],
    });
  });

  it('should rFail work', async () => {
    const ctx = app.mockContext();
    assert.deepStrictEqual(ctx.helper.rFail(1), {
      success: false,
      code: 1,
      msg: 'Unknown Error',
      data: undefined,
    });
    assert.deepStrictEqual(ctx.helper.rFail(2, { foo: 'bar' }), {
      success: false,
      code: 2,
      msg: 'Illegal Request',
      data: { foo: 'bar' },
    });
  });

  it('should rList work', async () => {
    const ctx = app.mockContext();
    assert.deepStrictEqual(
      ctx.helper.rList({
        page: 1,
        limit: 2,
        count: 32,
        rows: [
          { userId: 1, username: 'root' },
          { userId: 2, username: 'sdut' },
        ],
      }),
      {
        success: true,
        data: {
          page: 1,
          limit: 2,
          count: 32,
          rows: [
            { userId: 1, username: 'root' },
            { userId: 2, username: 'sdut' },
          ],
        },
      },
    );
  });

  it('should rFullList work', async () => {
    const ctx = app.mockContext();
    assert.deepStrictEqual(
      ctx.helper.rFullList({
        count: 32,
        rows: [
          { userId: 1, username: 'root' },
          { userId: 2, username: 'sdut' },
        ],
      }),
      {
        success: true,
        data: {
          count: 32,
          rows: [
            { userId: 1, username: 'root' },
            { userId: 2, username: 'sdut' },
          ],
        },
      },
    );
  });
});
