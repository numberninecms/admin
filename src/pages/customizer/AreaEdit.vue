<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page>
        <q-splitter v-model="splitter" class="full-height">
            <template v-slot:before>
                <q-resize-observer @resize="onSplitterChanged" debounce="0" />
                <DynamicFrame id="page-builder-content-frame"
                              ref="iframe"
                              :height="frameHeight"
                              :src="url" :loading="isLoading"
                              @loaded="onLoaded" disable-links />
            </template>
            <template v-slot:after>
                <PageBuilderSidebar :height="frameHeight"/>
            </template>
        </q-splitter>

        <MediaLibraryDialog/>
    </q-page>
</template>

<script lang="ts">
import { EventBus } from 'src/event/EventBus';
import URI from 'urijs';
import { Component, Ref, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DynamicFrame from '../../components/content/DynamicFrame.vue';
import PageBuilderSidebar from 'src/components/pagebuilder/PageBuilderSidebar.vue';
import MediaLibraryDialog from 'components/medialibrary/MediaLibraryDialog.vue';

const AreaStore = namespace('Area');
const SettingStore = namespace('Setting');
const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: { DynamicFrame, PageBuilderSidebar, MediaLibraryDialog },
})
export default class ContentEdit extends Vue {
    @AreaStore.State private areas;
    @SettingStore.State private settings;
    @SettingStore.Action private querySettings;
    @PageBuilderStore.Action private fetchComponentsForArea;
    @PageBuilderStore.Action private setViewSize;

    @Ref('iframe')
    private iframe: any;

    private frameHeight = 0;
    private isLoading = true;
    private splitter = 70;

    private created() {
        this.fetchComponentsForArea(this.currentArea);
        this.querySettings();

        window.addEventListener('resize', () => this.onResize(document.documentElement.clientHeight));
        this.onResize(document.documentElement.clientHeight);
    }

    private onResize(height): void {
        this.frameHeight = height;
        this.$forceUpdate();
    }

    private onLoaded(): void {
        this.isLoading = false;
        EventBus.emit('Frame:loaded');
    }

    private onSplitterChanged({width}): void {
        if (width > 1280) {
            this.setViewSize('lg');
        } else if (width > 768) {
            this.setViewSize('md');
        } else {
            this.setViewSize('sm');
        }

        EventBus.emit('Frame:resize');
        EventBus.emit('Frame:auto-view-size');
    }

    private get currentArea() {
        return this.$route.params.area;
    }

    private get url(): string {
        if (this.settings.length === 0) {
            return '';
        }

        const rootUrl = this.settings.find((s) => s.name === 'root_absolute_url');

        return rootUrl ? new URI(rootUrl.value).addQuery('n9', 'admin').addQuery('area', this.currentArea).toString() : '';
    }
}
</script>
