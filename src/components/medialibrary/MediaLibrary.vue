<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-card :flat="!popup" :class="{'q-pa-none': !popup}">
        <q-card-section class="row q-py-sm" v-if="popup">
            <div class="text-h6" style="line-height: 2.3rem">Select a file</div>
            <q-space/>
            <q-btn flat icon="close" @click="show({value: false, callback: null, options: null})" />
        </q-card-section>
        <q-separator v-if="popup" />
        <q-card-section class="q-py-sm row">
            <q-tabs v-model="tab" dense align="left">
                <q-tab name="explorer" label="Media Library" />
                <q-tab name="upload" label="Upload Files" />
            </q-tabs>
            <q-space/>
            <q-input filled dense v-model="filter" debounce="300" label="Search" class="q-mb-xs">
                <template v-slot:append>
                    <q-icon v-if="filter === ''" name="search" />
                    <q-icon v-else name="clear" class="cursor-pointer" @click="filter = ''" />
                </template>
            </q-input>
        </q-card-section>
        <q-card-section class="scroll q-py-none" :class="{'no-actions': !(hasSelectedFiles && hasCallback), 'middle-section': popup}">
            <q-tab-panels v-model="tab" keep-alive>
                <q-tab-panel name="explorer" class="q-px-xs q-py-none" :class="{'middle-section': popup}">
                    <MediaExplorer :multiple="multiple" :popup="popup" :filter="filter" />
                </q-tab-panel>

                <q-tab-panel name="upload" class="column">
                    <div class="q-gutter-x-md q-pb-md row justify-start items-center" style="height: 60px">
                        <q-checkbox dense v-model="resizeOptions.enabled" label="Resize before upload" />
                        <div v-if="resizeOptions.enabled" class="q-gutter-x-md q-mt-none row justify-start items-center">
                            <q-input dense v-model.number="resizeOptions.width" type="number" label="Max width" style="max-width: 70px" />
                            <q-input dense v-model.number="resizeOptions.height" type="number" label="Max height" style="max-width: 70px" />
                            <q-select dense v-model="resizeOptions.mimeType" :options="mimeTypes" emit-value map-options label="Format" style="width: 70px" />
                            <div style="max-width: 150px" v-if="resizeOptions.mimeType === 'image/jpeg'">
                                <q-badge color="primary">Quality: {{ resizeOptions.quality }}</q-badge>
                                <q-slider dense v-model="resizeOptions.quality" :min="0" :max="100" :step="1" label color="primary" style="width: 150px" />
                            </div>
                        </div>
                    </div>

                    <MediaUploader
                        sequential
                        :auto-upload="true"
                        :resize-options="resizeOptions"
                        :upload-url="uploadUrl"
                        @file-uploaded="onFileUploaded"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
        <q-separator v-if="hasSelectedFiles && hasCallback" />
        <q-card-actions align="right" v-if="hasSelectedFiles && hasCallback">
            <q-btn color="primary" @click="submit">Select files</q-btn>
        </q-card-actions>
    </q-card>
</template>
<script lang="ts">
import SelectOption from 'src/model/interfaces/SelectOption';
import { Component, Prop, Vue } from 'vue-property-decorator';
import MediaFile from 'src/model/interfaces/MediaFile';
import ResizeOptions from 'src/model/interfaces/ResizeOptions';
import { Routing } from 'src/utils/routing';
import { namespace } from 'vuex-class';
import MediaExplorer from './MediaExplorer.vue';
import MediaUploader from './MediaUploader.vue';

const ContentStore = namespace('Content');
const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: { MediaUploader, MediaExplorer }
})
export default class MediaLibrary extends Vue {
    @MediaLibraryStore.State private selectedFiles;
    @MediaLibraryStore.State private callback;
    @MediaLibraryStore.Action private close;
    @MediaLibraryStore.Action private submit;
    @MediaLibraryStore.Action private show;
    @ContentStore.Action private fetchPage;
    @ContentStore.Action private addEntity;

    @Prop({type: Boolean, default: false})
    private multiple: boolean;

    @Prop({type: Boolean, default: false})
    private popup: boolean;

    private tab = 'explorer';
    private filter = '';

    private resizeOptions: ResizeOptions = {
        enabled: false,
        width: 800,
        height: 800,
        quality: 75,
        mimeType: 'image/jpeg',
    };

    private mimeTypes: SelectOption[] = [
        { value: 'image/jpeg', label: 'JPEG' },
        { value: 'image/png', label: 'PNG' },
    ];

    private get uploadUrl() {
        return Routing.generate('numbernine_admin_media_files_upload');
    }

    private onFileUploaded(file: MediaFile) {
        this.addEntity(file);
    }

    private get hasSelectedFiles() {
        return this.selectedFiles.length > 0;
    }

    private get hasCallback(): boolean {
        return typeof this.callback === 'function';
    }
}
</script>
<style lang="scss" scoped>
.middle-section {
    height: calc(100vh - 214px);

    &.no-actions {
        height: calc(100vh - 161px);
    }
}
</style>
