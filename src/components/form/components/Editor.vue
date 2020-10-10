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
        <q-editor ref="editor" :value="value" @input="$emit('input', $event);" :definitions="definitions" :toolbar="toolbar"/>
        <q-resize-observer @resize="onResize" />
    </div>
</template>

<script lang="ts">
import { QEditor } from 'quasar';
import MediaFile from 'src/model/interfaces/MediaFile';
import { getCaretPosition, setCaretPosition } from 'src/utils/form-utils';
import { dirname } from 'src/utils/string-utils';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MediaLibraryStore = namespace('MediaLibrary');

@Component
export default class Editor extends Vue {
    @MediaLibraryStore.State private isShown;
    @MediaLibraryStore.Action private show;

    @Prop()
    private value: string;

    @Ref('editor')
    private editor: QEditor;

    private caretPosition = 0;

    private definitions = {
        media: {
            tip: 'Add a media file',
            icon: 'mdi-folder-multiple-image',
            label: 'Media file',
            handler: this.addMedia.bind(this)
        },
        mediaXs: {
            tip: 'Add a media file',
            icon: 'mdi-folder-multiple-image',
            label: '',
            handler: this.addMedia.bind(this)
        }
    }

    private toolbarLg = [
        ['media'],
        [
            {
                label: this.$q.lang.editor.formatting,
                icon: this.$q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                    'p',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'code'
                ]
            },
            {
                label: this.$q.lang.editor.fontSize,
                icon: this.$q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                    'size-1',
                    'size-2',
                    'size-3',
                    'size-4',
                    'size-5',
                    'size-6',
                    'size-7'
                ]
            },
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['link'],
        ['left', 'center', 'right', 'justify'],
        ['undo', 'redo'],
        ['viewsource'],
    ];

    private toolbarXs = [
        [
            'mediaXs',
            {
                label: this.$q.lang.editor.formatting,
                icon: this.$q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                    'p',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'code'
                ]
            },
            {
                label: this.$q.lang.editor.fontSize,
                icon: this.$q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                    'size-1',
                    'size-2',
                    'size-3',
                    'size-4',
                    'size-5',
                    'size-6',
                    'size-7'
                ]
            },
            'bold', 'italic', 'strike', 'underline', 'subscript', 'superscript',
            'link',
            'left', 'center', 'right', 'justify',
            'undo', 'redo',
            'viewsource',
        ]
    ];

    private size: {width: number, height: number} = {width: 0, height: 0};

    private get toolbar() {
        if (this.size.width > 800) {
            return this.toolbarLg;
        }

        return this.toolbarXs;
    }

    private onResize(size: {width: number, height: number}) {
        this.size = size;
    }

    @Watch('isShown')
    private onShowChanged() {
        if (!this.isShown) {
            this.editor.focus();
        }
    }

    private addMedia() {
        this.caretPosition = getCaretPosition(this.editor.$el.getElementsByClassName('q-editor__content')[0]);
        this.show({ value: true, callback: this.selectFile.bind(this) });
    }

    private selectFile(files: MediaFile[]) {
        if (files.length > 0) {
            setCaretPosition(this.editor.$el.getElementsByClassName('q-editor__content')[0], this.caretPosition);

            for (const file of files) {
                let insertText = '';

                if (file.mimeType.substr(0, 5) === 'image') {
                    insertText = `<img src="${dirname(file.path)}/${file.sizes.preview.filename}" alt="${file.title}">`;
                } else if (file.mimeType.substr(0, 5) === 'video') {
                    insertText = `
                        <video controls>
                            <source src="${file.path}" type="${file.mimeType}">
                            <p>Your browser is too old to read HTML5 videos. Please upgrade.</p>
                        </video>
                    `.trim();
                }

                this.editor.runCmd('insertHTML', insertText);
            }
        }
    }
}
</script>
