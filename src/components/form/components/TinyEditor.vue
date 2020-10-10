<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <Editor v-if="active"
            :init="init"
            :value="value"
            @input="$emit('input', $event)"
    />
</template>

<script lang="ts">
import 'tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'src/tinymce/plugins/medialibrary';

import { Editor } from '@tinymce/tinymce-vue/lib/es2015/main/ts/components/Editor';
import { EventBus } from 'src/event/EventBus';
import { MediaLibraryMode } from 'src/model/enums/MediaLibraryMode';
import MediaFile from 'src/model/interfaces/MediaFile';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: {Editor},
})
export default class TinyEditor extends Vue {
    @MediaLibraryStore.State private mediaSettings;
    @MediaLibraryStore.Action private show;

    @Prop()
    private value?: string;

    @Prop({type: Boolean, default: false})
    private autogrow!: boolean;

    private active = false;

    private init = {
        theme: 'silver',
        skin: false,
        content_css: false,
        branding: false,
        height: 500,
        menubar: false,
        relative_urls: false,
        plugins: [
            'advlist autolink lists link image imagetools charmap print preview anchor',
            'searchreplace visualblocks code',
            'insertdatetime media table paste code help wordcount',
            'medialibrary',
            this.autogrow ? 'autoresize' : '',
        ],
        toolbar:
            'medialibrary | undo redo copy paste | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | charmap anchor | searchreplace | \
            removeformat | code | wordcount | help',
        formats: {
            alignleft: { selector: 'img', styles: { float: 'left', margin: '10px 10px 10px 0' } },
            alignright: { selector: 'img', styles: { float: 'right', margin: '10px 0 10px 10px' } },
            aligncenter: { selector: 'img', styles: { display: 'block', margin: '10px auto' } },
        }
    };

    private created(): void {
        EventBus.on('TinyEditor:showMediaLibrary', (editor) => {
            this.show({
                value: true,
                callback: (files: MediaFile[]) => editor.execCommand('n9InsertFiles', false, {files, settings: this.mediaSettings}),
                options: {
                    mode: MediaLibraryMode.EditorInsert,
                }
            });
        });
    }

    private activated(): void {
        this.active = true;
    }

    private deactivated(): void {
        this.active = false;
    }
}
</script>
