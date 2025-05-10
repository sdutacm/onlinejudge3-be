import { Context, controller, get, provide } from 'midway';
import { routesBe } from '@/common/routes/be.route';

@provide()
@controller('/')
export class HomeController {
  @get('/')
  public index(ctx: Context): void {
    const publicRoutes = Object.keys(routesBe)
      .filter((routeName) => !routesBe[routeName].private)
      .map((routeName) => {
        // @ts-ignore
        const route = routesBe[routeName];
        return {
          module: route.module,
          id: route.i,
          method: route.method,
          url: route.url,
          description: route.description,
          contract: route.contract,
        };
      });
    ctx.body = {
      success: true,
      data: {
        desc: `OnlineJudge3 API`,
        tips:
          'For contract definition and return code, please refer to https://github.com/sdutacm/onlinejudge3-common',
        sys: {
          node: process.versions.node,
        },
        api: {
          count: publicRoutes.length,
          rows: publicRoutes,
        },
      },
    };
  }

  @get('/ping')
  public ping(ctx: Context): void {
    ctx.body = 'OK';
  }
}
