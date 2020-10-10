/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Area from 'src/model/interfaces/Area';
import { Module, MutationAction, VuexModule } from 'vuex-module-decorators';
import { axios, Routing } from 'src/utils/routing';

@Module({ namespaced: true })
export default class AreaModule extends VuexModule {
    public areas: Area[] = [];
    public selectedArea?: Area = undefined;
    public isLoading = false;

    @MutationAction({ mutate: ['areas', 'isLoading'] })
    public async queryAreas() {
        this.isLoading = true;
        const response = await axios.get(Routing.generate('numbernine_admin_areas_get_collection'));
        return { areas: response.data, isLoading: false };
    }
}
