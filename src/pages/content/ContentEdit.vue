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
                              v-if="currentEntity"
                              :height="frameHeight"
                              :src="url" :loading="isLoading"
                              @loaded="onLoaded" disable-links />
            </template>
            <template v-slot:after>
                <PageBuilderSidebar :height="frameHeight"
                                    :has-classic-editor="true"
                                    @open-classic-editor="openClassicEditor()"/>
            </template>
        </q-splitter>
        <MediaLibraryDialog/>
    </q-page>
</template>

<script lang="ts">
import MediaLibraryDialog from 'components/medialibrary/MediaLibraryDialog.vue';
import {Component, Prop, Vue} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DynamicFrame from '../../components/content/DynamicFrame.vue';
import PageBuilderSidebar from '../../components/pagebuilder/PageBuilderSidebar.vue';
import {EventBus} from 'src/event/EventBus';
import URI from 'urijs';

const PageBuilderStore = namespace('PageBuilder');
const ContentTypeStore = namespace('ContentType');

@Component({
    components: { DynamicFrame, PageBuilderSidebar, MediaLibraryDialog },
})
export default class ContentEdit extends Vue {
    @PageBuilderStore.Action private setDragId;
    @PageBuilderStore.Action private fetchEntity;
    @PageBuilderStore.Action private fetchNewEntity;
    @PageBuilderStore.Action private fetchComponentsForCurrentEntity;
    @PageBuilderStore.Action private stopLoading;
    @PageBuilderStore.Action private setViewSize;
    @PageBuilderStore.State private currentEntity;
    @PageBuilderStore.State private isLoading;
    @ContentTypeStore.State private contentTypes;

    @Prop()
    private id: number;

    @Prop()
    private type: string;

    private frameHeight = 0;
    private splitter = 70;

    private created() {
        EventBus.on('ContentType:loaded', () => { this.fetchContent(); });

        if(this.contentTypes.length > 0) {
            this.fetchContent();
        }

        window.addEventListener('resize', () => this.onResize(document.documentElement.clientHeight));
        this.onResize(document.documentElement.clientHeight);
    }

    private async fetchContent() {
        if (this.id) {
            await this.fetchEntity({type: this.type, id: this.id});
        } else {
            const entity = await this.fetchNewEntity({type: this.type});
            await this.$router.push({name: this.type + '_edit', params: {id: entity.id, type: this.type}});
            return;
        }

        await this.fetchComponentsForCurrentEntity();
    }

    private onResize(height): void {
        this.frameHeight = height;
        this.$forceUpdate();
    }

    private onLoaded() {
        this.stopLoading();
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

    private openClassicEditor() {
        this.$router.push({name: this.type + '_edit_classic', params: {id: this.id.toString(), type: this.type}});
    }

    private get url(): string {
        if (!this.currentEntity) {
            return '';
        }

        return new URI(this.currentEntity.publicUrl).addQuery('n9', 'admin').toString();
    }
}
</script>
