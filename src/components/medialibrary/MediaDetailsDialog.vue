<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-dialog :value="value" @input="$emit('input', $event)" persistent full-height full-width>
        <q-card class="column full-height">
            <q-card-section class="row justify-between">
                <div class="text-h6">Media details</div>
                <q-btn-group unelevated flat>
                    <q-btn icon="keyboard_arrow_left" @click="previous" />
                    <q-btn icon="keyboard_arrow_right" @click="next" />
                </q-btn-group>
                <q-btn flat icon="close" @click="close" />
            </q-card-section>

            <q-separator />

            <q-card-section class="col row">
                <div class="col-9 row items-center justify-center full-height">
                    <q-img v-if="fileType === 'image'" :src="large" :alt="file.title" contain class="full-height" :style="{maxHeight: file.sizes.large.height + 'px'}" />
                    <q-video v-if="fileType === 'video'" :src="file.path" class="fit" />
                </div>
                <div class="col-3 column q-pl-md">
                    <div>
                        <b>File name:</b> {{ file.slug }}
                    </div>
                    <div>
                        <b>File type:</b> {{ file.mimeType }}
                    </div>
                    <div>
                        <b>Uploaded on:</b> {{ createdAt }}
                    </div>
                    <div>
                        <b>File size:</b> {{ fileSize }}
                    </div>
                    <div v-if="fileType === 'image' || fileType === 'video'">
                        <b>File dimensions: </b> <span>{{ file.width }} x {{ file.height }}</span>
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="row justify-end q-pa-md">
                <q-btn  :color="isMediaSelected ? 'negative' : 'primary'" @click="toggleSelect" :label="isMediaSelected ? 'Unselect file' : 'Select file'" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import dateFormat from 'dateformat';
import * as path from 'path';
import { Component, Prop, Vue } from 'vue-property-decorator';
import MediaFile from 'src/model/interfaces/MediaFile';
import { readableBytes } from 'src/utils/string-utils';
import { namespace } from 'vuex-class';

const MediaLibraryStore = namespace('MediaLibrary');

@Component
export default class MediaDetailsDialog extends Vue {
    @MediaLibraryStore.State private selectedFiles;
    @MediaLibraryStore.Action private selectFile;
    @MediaLibraryStore.Getter private isSelected;

    @Prop({type: Boolean})
    private value: boolean;

    @Prop()
    private file: MediaFile;

    private created() {
        window.addEventListener('keyup', (e) => {
            if (!this.value) {
                return;
            }

            switch (e.key) {
                case 'Left':
                case 'ArrowLeft':
                    this.previous();
                    break;
                case 'Right':
                case 'ArrowRight':
                    this.next();
                    break;
                case 'Escape':
                    this.close();
                    break;
                case ' ':
                    this.toggleSelect();
                    break;
            }
        });
    }

    private previous() {
        this.$emit('previous');
    }

    private next() {
        this.$emit('next');
    }

    private close() {
        this.$emit('input', false);
    }

    private toggleSelect() {
        this.selectFile(this.file);
    }

    private get large(): string {
        return `${path.dirname(this.file.path)}/${this.file.sizes.large.filename}`;
    }

    private get createdAt(): string {
        return dateFormat(this.file.createdAt, 'longDate');
    }

    private get fileSize(): string {
        return readableBytes(this.file.fileSize);
    }

    private get isMediaSelected(): boolean {
        return this.isSelected(this.file);
    }

    private get fileType(): string {
        return this.file.mimeType.replace(/\/.*/i, '');
    }
}
</script>
