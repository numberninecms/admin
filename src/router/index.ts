/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import VueRouter from 'vue-router';
import routes, { adminRoutes } from './routes';
import store from '../store';
import { RouteConfig } from 'vue-router';
import { getContentEntityRoutes } from './routingFunctions';
import { Loading } from 'quasar';

Vue.use(VueRouter);

Component.registerHooks([
    'beforeRouteEnter',
    'beforeRouteUpdate',
    'beforeRouteLeave'
]);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */
const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE as 'hash' | 'history' | 'abstract' | undefined,
    base: process.env.VUE_ROUTER_BASE
});

let routesLoaded = false;

router.beforeEach(async (to, from, next) => {
    Loading.show();

    if (!routesLoaded) {
        if (store.state.Layout.mainMenuItems.length === 0) {
            await store.dispatch('Layout/fetchMainMenuItems');
        }

        const routes: RouteConfig[] = adminRoutes;
        const contentEntityRoutes: RouteConfig[] = getContentEntityRoutes(store.state.Layout.mainMenuItems);
        routes[0].children!.push(...contentEntityRoutes);

        router.addRoutes(routes);
        routesLoaded = true;

        const route = router.resolve(to.path);

        if (route) {
            next({path: route.route.path});
        }
    } else {
        next();
    }
});

router.afterEach(() => {
    Loading.hide();
})

export default router;
