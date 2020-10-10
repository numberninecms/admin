<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="mediafile row justify-center items-center shadow-2 relative-position" :class="{'selected': isSelected}">
        <q-img v-if="thumbnail" :src="thumbnail" />
        <div v-else>
            <q-icon name="insert_drive_file" color="primary" style="font-size: 7rem;" />
            <div class="absolute-bottom row justify-center items-center bg-blue-grey-8 text-white translucent">
                <span class="text-center text-mini">{{ file.slug }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import path from 'path';
import { Component, Prop, Vue } from 'vue-property-decorator';
import MediaFile from 'src/model/interfaces/MediaFile';
import { namespace } from 'vuex-class';

const MediaLibraryStore = namespace('MediaLibrary');

@Component
export default class MediaThumbnail extends Vue {
    @MediaLibraryStore.State private selectedFiles;

    @Prop()
    private file: MediaFile;

    private get thumbnail(): string | null {
        return this.file.mimeType.substr(0, 5) === 'image' ? `${path.dirname(this.file.path)}/${this.file.sizes.thumbnail.filename}` : null;
    }

    private get isSelected(): boolean {
        return !!this.selectedFiles.find((f) => f.id === this.file.id);
    }
}
</script>
<style lang="scss" scoped>
.mediafile {
    width: 150px;
    height: 150px;
    cursor: pointer;
}
.selected {
    outline: 3px solid $primary;
}
.translucent {
    opacity: 0.75;
}
.text-mini {
    font-size: 0.65rem;
}
</style>
