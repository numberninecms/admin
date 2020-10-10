/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import axios from 'axios';
import Routing from 'fos-routing';
import RoutingData from '../assets/routes/fos_js_routes';
import AxiosGeneric from '../services/AxiosGeneric';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Routing.setData(RoutingData);

const axiosGeneric: AxiosGeneric = new AxiosGeneric();

export { axios, axiosGeneric, Routing };
