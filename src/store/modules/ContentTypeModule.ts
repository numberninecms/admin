/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, MutationAction, VuexModule } from 'vuex-module-decorators';
import { EventBus } from 'src/event/EventBus';
import { axios, Routing } from 'src/utils/routing';
import ContentType from 'src/model/interfaces/ContentType';

@Module({ namespaced: true })
export default class ContentTypeModule extends VuexModule {
    public contentTypes: ContentType[] = [];

    @MutationAction({mutate: ['contentTypes']})
    public async fetchContentTypes() {
        const response = await axios.get(Routing.generate('numbernine_admin_contenttypes_get_collection'));
        EventBus.emit('ContentType:loaded');
        return {contentTypes: response.data as ContentType[]};
    }

    public get findByName() {
        return (name: string) => {
            return this.contentTypes.find((c) => c.name === name);
        }
    }
}
