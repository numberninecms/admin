<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div>
        <q-img v-if="file" :src="thumbnail" contain class="full-width q-mb-sm" style="max-height: 150px" />
        <q-btn outline class="full-width" :color="color" label="Select media" @click="showMediaLibrary = true" />
    </div>
</template>
<script lang="ts">
import { MediaLibraryMode } from 'src/model/enums/MediaLibraryMode';
import { Component, Prop, Vue } from 'vue-property-decorator';
import path from 'path';
import MediaFile from 'src/model/interfaces/MediaFile';
import { namespace } from 'vuex-class';

const ContentStore = namespace('Content');
const MediaLibraryStore = namespace('MediaLibrary');

@Component
export default class MediaSelect extends Vue {
    @MediaLibraryStore.State private isDetailsPaneOpen;
    @MediaLibraryStore.State private isShown;
    @MediaLibraryStore.Action private show;
    @ContentStore.Action private fetchById;
    @ContentStore.Getter private findById;

    @Prop()
    private value: number;

    @Prop()
    private color: string;

    private file: MediaFile | null = null;

    private async created() {
        if (this.value) {
            await this.fetchById({type: 'media_file', id: this.value});
            this.file = this.findById(this.value);
            this.$emit('input-computed', {parameter: 'image', value: this.file});
        }
    }

    private get thumbnail(): string {
        return this.file ?`${path.dirname(this.file.path)}/${this.file.sizes.preview.filename}` : '';
    }

    private get showMediaLibrary() {
        return this.isShown;
    }

    private set showMediaLibrary(value) {
        this.show({
            value,
            callback: value ? this.selectFile.bind(this) : null,
            options: {
                mode: MediaLibraryMode.MediaSelect,
            }
        });
    }

    private selectFile(files: MediaFile[]) {
        if (files.length > 0) {
            this.file = files[0];
            this.$emit('input', {parameter: 'id', value: this.file.id});
            this.$emit('input-computed', {parameter: 'image', value: this.file});
        }
    }
}
</script>
