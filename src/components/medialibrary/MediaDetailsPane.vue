<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="q-gutter-y-md q-pa-md bg-grey-1" v-if="value">
        <div class="row q-gutter-x-md">
            <div class="col">
                <q-img v-if="fileType === 'image'" :src="large" :alt="value.title" contain />
                <q-video v-if="fileType === 'video'" :src="value.path" />
            </div>
            <div class="col">
                <div>
                    <b>File name:</b> {{ value.slug }}
                </div>
                <div>
                    <b>File type:</b> {{ value.mimeType }}
                </div>
                <div>
                    <b>Uploaded on:</b> {{ createdAt }}
                </div>
                <div>
                    <b>File size:</b> {{ fileSize }}
                </div>
                <div v-if="fileType === 'image' || fileType === 'video'">
                    <b>File dimensions: </b> <span>{{ value.width }} x {{ value.height }} pixels</span>
                </div>
            </div>
            <div class="q-mt-md">URL: <a :href="absoluteUrl" target="_blank">{{ absoluteUrl }}</a></div>
        </div>
        <div class="q-gutter-y-sm" v-if="mode !== MediaLibraryMode.View">
            <q-input dense filled v-model="value.title" label="Title" @input="$emit('input', value)" debounce="300"/>
            <q-input v-if="mode === MediaLibraryMode.EditorInsert" dense filled type="textarea" autogrow v-model="value.caption" label="Caption" @input="$emit('input', value)" debounce="300"/>
            <q-input dense filled v-model="value.alternativeText" label="Alternative text" @input="$emit('input', value)" debounce="300"/>
            <q-input v-if="mode === MediaLibraryMode.EditorInsert" dense filled type="textarea" autogrow v-model="value.content" label="Description" @input="$emit('input', value)" debounce="300"/>

            <p class="text-bold q-mt-md">Media settings</p>
            <q-select dense filled :options="fileSizesOptions" v-model="settings.size" map-options emit-value label="Size"/>
            <q-select v-if="mode === MediaLibraryMode.EditorInsert" dense filled :options="alignmentOptions" v-model="settings.alignment" map-options emit-value label="Alignment"/>
            <q-select v-if="mode === MediaLibraryMode.EditorInsert" dense filled :options="linkOptions" v-model="settings.link" map-options emit-value label="Link"/>
            <q-input v-if="mode === MediaLibraryMode.EditorInsert && settings.link === 'custom'" dense filled label="Link URL" v-model="settings.linkUrl"/>
        </div>
    </div>
</template>
<script lang="ts">
import dateFormat from 'dateformat';
import path from 'path';
import { MediaLibraryMode } from 'src/model/enums/MediaLibraryMode';
import MediaSettings from 'src/model/interfaces/MediaSettings';
import SelectOption from 'src/model/interfaces/SelectOption';
import MediaFile from 'src/model/interfaces/MediaFile';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { readableBytes } from 'src/utils/string-utils';
import { upperFirst, cloneDeep } from 'lodash';
import { namespace } from 'vuex-class';

const MediaLibraryStore = namespace('MediaLibrary');

@Component
export default class MediaDetailsPane extends Vue {
    @MediaLibraryStore.State private libraryOptions;
    @MediaLibraryStore.State private mediaSettings;
    @MediaLibraryStore.Action private updateMediaSettings;

    @Prop()
    private value: MediaFile;

    private settings: MediaSettings = {
        size: 'medium',
        alignment: 'center',
        link: 'media',
        linkUrl: ''
    };

    private MediaLibraryMode = MediaLibraryMode;

    private readonly alignmentOptions: SelectOption[] = [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
        { label: 'None', value: 'none' },
    ];

    private readonly linkOptions: SelectOption[] = [
        { label: 'None', value: 'none' },
        { label: 'Media', value: 'media' },
        { label: 'Media page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
    ];

    private created() {
        this.settings = Object.assign({}, this.mediaSettings);
    }

    private get absoluteUrl(): string {
        return `${window.location.origin}${this.value.path}`;
    }

    private get large(): string {
        return `${path.dirname(this.value.path)}/${this.value.sizes.large.filename}`;
    }

    private get createdAt(): string {
        return dateFormat(this.value.createdAt, 'longDate');
    }

    private get fileSize(): string {
        return readableBytes(this.value.fileSize);
    }

    private get fileType(): string {
        return this.value.mimeType.replace(/\/.*/i, '');
    }

    private get fileSizesOptions(): SelectOption[] {
        return [
            {
                label: `Original size - ${this.value.width} x ${this.value.height}`,
                value: 'original',
            },
            ...Object.keys(this.value.sizes).map((name) => {
                return {
                    label: `${upperFirst(name)} - ${this.value.sizes[name].width} x ${this.value.sizes[name].height}`,
                    value: name,
                };
            })
        ];
    }

    private get mode(): MediaLibraryMode {
        return this.libraryOptions?.mode ?? MediaLibraryMode.View;
    }

    @Watch('settings.link')
    private onLinkOptionChanged() {
        if (this.settings.link !== 'custom') {
            this.settings.linkUrl = '';
        }
    }

    @Watch('settings', {deep: true})
    private onSettingsChanged() {
        this.updateMediaSettings(cloneDeep(this.settings));
    }
}
</script>
