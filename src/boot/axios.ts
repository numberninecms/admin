/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import axiosHydra from '../services/AxiosGeneric';
import { axios } from '../utils/routing';

export default ({ app, Vue }) => {
    app.$axios = axios;
    app.$axiosHydra = axiosHydra;

    Vue.prototype.$axios = axios;
    Vue.prototype.$axiosHydra = axiosHydra;
};
