<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-card class="uploadable-file" draggable="true" @click.prevent>
        <div class="relative-position">
            <q-img v-if="imageSource" :src="imageSource" contain class="square" />
            <q-icon v-else name="insert_drive_file" color="primary" class="square" style="font-size: 7rem;" />

            <q-inner-loading size="4rem" :showing="file.uploadProgress === 1">
                <q-spinner-grid color="primary" />
            </q-inner-loading>
        </div>

        <q-card-actions>
            <p class="full-width text-center text-caption text-primary q-mb-sm">{{ file.file.name }}</p>
            <div class="full-width flex row justify-between q-gutter-x-md">
                <div class="flex items-center col-grow q-ml-none">
                    <q-linear-progress :value="file.uploadProgress" />
                </div>
                <q-btn dense flat color="negative" icon="close" class="col-auto" @click.prevent="$emit('remove')" />
            </div>
            <div v-if="file.error === 'file_too_big'" class="column text-negative">
                <span>File is too big!</span>
                <span v-if="file.image">Consider resizing it before upload.</span>
            </div>
        </q-card-actions>
    </q-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ParsedFile from 'src/model/interfaces/ParsedFile';

@Component
export default class MediaUploadableFile extends Vue {
    @Prop()
    private file: ParsedFile;

    @Prop()
    private defaultThumbnail: string;

    private get imageSource() {
        return this.file.thumbnail ? this.file.thumbnail.src : null;
    }
}
</script>
<style lang="scss">
$square-size: 250px;

.uploadable-file {
    max-width: $square-size;
}

.square {
    position: relative;
    width: $square-size;
    height: $square-size;
}
</style>
