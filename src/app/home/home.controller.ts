import { Context, config, controller, get, provide } from 'midway';
import { routesBe } from '@/common/routes/be.route';

@provide()
@controller('/')
export class HomeController {
  constructor(@config() private readonly welcomeMsg: string) {}

  @get('/')
  public index(ctx: Context): void {
    ctx.body = {
      success: true,
      data: {
        desc: `OnlineJudge3 API`,
        sys: {
          node: process.versions.node,
        },
        api: {
          count: Object.keys(routesBe).length,
          rows: Object.keys(routesBe).map((routeName) => {
            // @ts-ignore
            const route = routesBe[routeName];
            return {
              method: route.method,
              url: route.url,
            };
          }),
        },
      },
    };
  }

  @get('/ping')
  public ping(ctx: Context): void {
    ctx.body = 'OK';
  }
}
