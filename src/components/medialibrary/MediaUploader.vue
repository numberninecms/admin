<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="drop-area fit border border-dashed row content-stretch"
         :class="{'dragover': isDraggingOver, 'no-style': noStyle}"
         @dragover.prevent
         @dragenter.prevent="onDragEnter"
         @dragleave.prevent="onDragLeave"
         @drop.stop.prevent="onDrop"
    >
        <label :class="{'q-pa-md': !noStyle}" class="full-width row">
            <span v-if="files.length === 0 && !noStyle" class="full-width text-center">Drop your files here or click to select</span>
            <input type="file" multiple @change="onDrop" ref="fileInput">
            <slot>
                <component :is="containerType" v-if="files.length !== 0" class="flex wrap q-gutter-md" :list="files" group="files">
                    <MediaUploadableFile v-for="(file, index) in files" :key="file.file.name" :file="file" @remove="removeFile(index)" :default-thumbnail="defaultThumbnail" class="p-2 m-1" />
                </component>
            </slot>
        </label>

        <q-btn v-if="!autoUpload && this.files.length > 0" class="q-ma-md" color="primary" @click="uploadAll">Start upload</q-btn>
    </div>
</template>
<script lang="ts">
import { size, forEachRight, reverse } from 'lodash';
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import axios, { AxiosPromise } from 'axios';
import ParsedFile from 'src/model/interfaces/ParsedFile';
import ResizeOptions from 'src/model/interfaces/ResizeOptions';
import ImageResizer from 'src/services/ImageResizer';
import { namespace } from 'vuex-class';
import MediaUploadableFile from './MediaUploadableFile.vue';

const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: { MediaUploadableFile, draggable },
})
export default class MediaUploader extends Vue {
    @MediaLibraryStore.State private options;
    @MediaLibraryStore.Action private fetchOptions;

    @Ref('fileInput')
    private fileInput: HTMLInputElement;

    @Prop()
    private resizeOptions: ResizeOptions;

    @Prop({type: Boolean})
    private sequential: boolean;

    @Prop({type: Boolean})
    private draggable: boolean;

    @Prop({type: Boolean})
    private autoUpload: boolean;

    @Prop()
    private uploadUrl: string;

    @Prop({type: Boolean})
    private noStyle: boolean;

    @Prop()
    private defaultThumbnail: string;

    private dragCounter = 0;
    private isDraggingOver = false;
    private files: ParsedFile[] = [];

    private created() {
        this.fetchOptions();
    }

    private get containerType() {
        return this.draggable ? 'draggable' : 'div';
    }

    private onDragEnter() {
        if (!MediaUploader.supportsDragAndDrop) {
            return;
        }

        this.dragCounter++;
        this.isDraggingOver = true;
    }

    private onDragLeave() {
        if (!MediaUploader.supportsDragAndDrop) {
            return;
        }

        this.dragCounter--;

        if(this.dragCounter <= 0) {
            this.dragCounter = 0;
            this.isDraggingOver = false;
        }
    }

    private async onDrop(e) {
        this.onDragLeave();

        // Only add new files when we actually drop new files and not only sorting elements
        if (e.target && size(e.target.files) > 0 || e.dataTransfer && size(e.dataTransfer.files) > 0) {
            const files: File[] = e.target.files || e.dataTransfer.files || [];
            const parsedFiles: ParsedFile[] = [];

            for (const file of files) {
                if (this.files.find((f) => f.file.name === file.name)) {
                    continue;
                }

                try {
                    parsedFiles.push(await this.parseFile(file));
                } catch (e) {
                    parsedFiles.push({ file, image: document.createElement('img') });
                }
            }

            this.files.push(...parsedFiles);

            if (this.autoUpload) {
                this.uploadAll();
            }
        }

        // Must reset value in order to fire @change even if we select the same file
        this.fileInput.value = '';
    }

    private uploadAll() {
        if (!this.uploadUrl) {
            return;
        }

        forEachRight(reverse(this.files), async (file) => {
            if (file.image && this.resizeOptions && this.resizeOptions.enabled && (this.resizeOptions.width < file.image.width || this.resizeOptions.height < file.image.height)) {
                file.image = ImageResizer.resizeImage(file.image, this.resizeOptions);

                if (ImageResizer.getImageFileSize(file.image) >= this.maxContentLength) {
                    file.error = 'file_too_big';
                    return false;
                }
            } else {
                if (file.file.size >= this.maxContentLength) {
                    file.error = 'file_too_big';
                    return false;
                }
            }

            if (!this.sequential) {
                this.asyncUploadFile(file)
                    .then((response) => {
                        if (response) {
                            this.onFileUploaded(file, response.data);
                        }
                    });
            } else {
                const response = await this.asyncUploadFile(file);
                if (response) {
                    this.onFileUploaded(file, response.data);
                }
            }
        });
    }

    private asyncUploadFile(file: ParsedFile): AxiosPromise<any> {
        const formData = new FormData();

        if (file.image) {
            const imageFile = new File([MediaUploader.convertDataUriToBlob(file.image.src)], file.file.name, { type: file.file.type });
            formData.append('file', imageFile);
        } else {
            formData.append('file', file.file);
        }


        return axios.post(this.uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            maxContentLength: this.maxContentLength,
            onUploadProgress: (progressEvent) => {
                Vue.set(this.files[this.files.indexOf(file)], 'uploadProgress', progressEvent.loaded / progressEvent.total);
            },
        });
    }

    private onFileUploaded(file: ParsedFile, data) {
        this.files.splice(this.files.indexOf(file), 1);
        this.$emit('file-uploaded', data);

        if (this.files.length === 0) {
            this.$emit('upload-finished', data);
        }
    }

    /**
     * Reads a file and resize if needed
     * @param file
     */
    private async parseFile(file: File): Promise<ParsedFile> {
        if (file.type.substr(0, 5) === 'image') {
            const image = await ImageResizer.createImageDataURLFromFile(file);
            const thumbnail = ImageResizer.resizeImage(image, {width: 250, height: 250, quality: 60});

            return {file, image, thumbnail};
        }

        return {file};
    }

    /**
     * Removes a file from the list
     * @param index
     */
    private removeFile(index) {
        this.files.splice(index, 1);
    }

    private get maxContentLength(): number {
        return this.options.hasOwnProperty('max_upload_size') ? this.options['max_upload_size'] : 0;
    }

    /**
     * Converts a data URI image to Blob so it can be uploaded
     * @param dataUri
     */
    private static convertDataUriToBlob(dataUri): Blob {
        let byteString;
        if (dataUri.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataUri.split(',')[1]);
        } else {
            byteString = unescape(dataUri.split(',')[1]);
        }

        // separate out the mime component
        const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        const ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type: mimeString});
    }

    private static get supportsDragAndDrop() {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && !('ontouchstart' in window || navigator.msMaxTouchPoints);
    }
}
</script>
<style lang="scss">
$light-gray: #f8f8f8;
$light-blue: #f5f8ff;
$gray: #ddd;
$blue: #bdcfff;
$dark-blue: #212544;

.drop-area {
    position: relative;
    overflow: hidden;

    &:not(.no-style) {
        border: 1px dashed $gray;
        background-color: $blue-grey-1;
    }

    &.no-style {
        label {
            margin-bottom: 0;
        }
    }

    &.dragover {
        border: 1px solid $blue-5;
        background-color: $blue-grey-2;
        color: $dark-blue;
    }

    input[type="file"] {
        position: absolute;
        opacity: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
}
</style>
