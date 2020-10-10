/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import AreaModule from 'src/store/modules/AreaModule';
import SettingModule from 'src/store/modules/SettingModule';
import LayoutModule from './modules/LayoutModule';
import ContentModule from './modules/ContentModule';
import ContentTypeModule from './modules/ContentTypeModule';
import MediaLibraryModule from './modules/MediaLibraryModule';
import PageBuilderModule from './modules/PageBuilderModule';
import MenuModule from 'src/store/modules/MenuModule';
import TaxonomyModule from 'src/store/modules/TaxonomyModule';
import UserModule from 'src/store/modules/UserModule';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        Layout: LayoutModule,
        ContentType: ContentTypeModule,
        Content: ContentModule,
        Taxonomy: TaxonomyModule,
        PageBuilder: PageBuilderModule,
        MediaLibrary: MediaLibraryModule,
        Area: AreaModule,
        Menu: MenuModule,
        Setting: SettingModule,
        User: UserModule,
    },
    strict: process.env.DEV as boolean | undefined,
});

