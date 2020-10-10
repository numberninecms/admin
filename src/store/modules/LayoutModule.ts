/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, MutationAction, VuexModule } from 'vuex-module-decorators';
import AdminMenuItem from 'src/model/interfaces/AdminMenuItem';
import { axios, Routing } from 'src/utils/routing';

@Module({ namespaced: true })
export default class LayoutModule extends VuexModule {
    public mainMenuItems: Record<string, AdminMenuItem>[] = [];

    @MutationAction({mutate: ['mainMenuItems']})
    public async fetchMainMenuItems(): Promise<{mainMenuItems: Map<string, AdminMenuItem>[]}> {
        const response = await axios.get(Routing.generate('numbernine_admin_menuitems_get_collection'));
        return { mainMenuItems: (response.data as Map<string, AdminMenuItem>[]) };
    }
}
