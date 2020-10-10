/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import Routing from 'fos-routing';
import { Emitter } from 'mitt';
import { AxiosGenericInterface } from './services/AxiosGeneric';
import VueRouter, { Route } from 'vue-router';
import { QVueGlobals } from 'quasar';

declare module 'vue-property-decorator' {
    interface Vue {
        $axios: AxiosInstance;
        $axiosHydra: AxiosGenericInterface;
        $routing: Routing;
        $router: VueRouter;
        $route: Route;
        $eventBus: Emitter;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $q: QVueGlobals
    }
}
