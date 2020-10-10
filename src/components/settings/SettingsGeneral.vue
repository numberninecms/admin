<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="column q-gutter-y-md">
        <q-toggle v-model="blogHomepage" label="Use posts archive as homepage"/>
        <q-select v-if="!blogHomepage" v-model="pageForFront" label="Homepage" filled :options="pages" option-value="id" option-label="title" map-options emit-value @input="saveSettings()" />
        <q-select v-if="!blogHomepage" v-model="pageForPosts" label="Posts archive page" filled :options="pages" option-value="id" option-label="title" map-options emit-value @input="saveSettings()" />
    </div>
</template>
<script lang="ts">
import SettingsBaseComponent from 'components/settings/SettingsBaseComponent';
import { EventBus } from 'src/event/EventBus';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import GenericObject from 'src/model/interfaces/GenericObject';
import { Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ContentStore = namespace('Content');

@Component
export default class SettingsGeneral extends SettingsBaseComponent {
    @ContentStore.State private contentEntities: GenericObject<ContentEntity[]>;
    @ContentStore.Action private fetchAll;

    private blogHomepage = true;

    private created(): void {
        EventBus.on('Settings:loaded', () => {
            if (this.pageForFront !== null) {
                this.blogHomepage = false;
            }
        });

        this.fetchAll({type: 'page', status: 'publish', orderBy: 'title', order: 'asc'});
    }

    @Watch('blogHomepage')
    private onBlogHomepageChange() {
        if (this.blogHomepage) {
            this.pageForFront = null;
            this.pageForPosts = null;
            this.saveSettings();
        }
    }

    private get pages(): ContentEntity[] {
        return this.contentEntities.hasOwnProperty('page') ? this.contentEntities['page'] : [];
    }

    private get pageForFront(): number|null {
        return this.getSettingAs('page_for_front', 'number');
    }

    private set pageForFront(value: number|null) {
        this.setSettingAs<number>('page_for_front', value);
    }

    private get pageForPosts(): number|null {
        return this.getSettingAs('page_for_posts', 'number');
    }

    private set pageForPosts(value: number|null) {
        this.setSettingAs<number>('page_for_posts', value);
    }

}
</script>
