/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EventBus } from 'src/event/EventBus';
import MediaFile from 'src/model/interfaces/MediaFile';
import PageComponent from 'src/model/interfaces/PageComponent';
import Preloader from 'src/model/interfaces/Preloader';

export class ImagePreloader implements Preloader {
    private readonly component: PageComponent;
    private readonly $store;

    constructor(component: PageComponent, store) {
        this.component = component;
        this.$store = store;
    }

    public async preload(): Promise<void> {
        let value: MediaFile|null = null;

        if (this.component.parameters.id) {
            value = await this.$store.dispatch('Content/fetchById', {type: 'media_file', id: this.component.parameters.id});
        } else if (this.component.parameters.fromTitle) {
            value = await this.$store.dispatch('Content/fetchByTitle', {type: 'media_file', title: this.component.parameters.fromTitle});
        }

        if (value) {
            await this.$store.dispatch('PageBuilder/updateComponentComputedParameter', {
                id: this.component.id,
                parameter: 'image',
                value
            });
            EventBus.emit('PageBuilder:update-parameter-after');
        }
    }
}
