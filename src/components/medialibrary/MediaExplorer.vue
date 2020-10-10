<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="full-height">
        <div class="row q-gutter-x-md" v-if="!hasCallback || multiple">
            <div class="row q-gutter-x-md">
                <q-checkbox v-model="isSelectMultipleMode" label="Select multiple" @input="onSelectMultipleModeChange" />
                <q-btn v-if="isSelectMultipleMode && hasSelectedFiles" color="primary" label="Cancel selection" @click="cancelMediaSelection" />
                <q-btn v-if="isSelectMultipleMode && hasSelectedFiles" color="negative" class="q-ml-md" label="Delete selection" @click="deleteMediaSelection" />
            </div>
        </div>
        <div :class="{'row': popup}" class="q-pt-sm full-height">
            <q-scroll-area v-if="popup" class="full-height" :class="{'col-9': popup && hasSelectedFiles, 'col': popup && !hasSelectedFiles}">
                <q-infinite-scroll class="flex wrap q-gutter-md q-pl-xs q-pt-xs full-height" @load="onLoad" :offset="250" ref="infiniteScroll">
                    <MediaThumbnail v-for="(file, index) in files" :file="file" :key="file.id" @click.native.exact="setBulkSelectFirstIndex(index)" @click.native.shift.exact="bulkMediaSelect(index)" />
                    <template v-slot:loading>
                        <div class="row justify-center q-my-md">
                            <q-spinner color="primary" size="3em" :thickness="2"/>
                        </div>
                    </template>
                </q-infinite-scroll>
            </q-scroll-area>
            <q-infinite-scroll v-else class="flex wrap q-gutter-md q-pl-xs q-pt-xs full-height" @load="onLoad" :offset="250" ref="infiniteScroll">
                <MediaThumbnail v-for="(file, index) in files" :file="file" :key="file.id" @click.native.exact="setBulkSelectFirstIndex(index)" @click.native.shift.exact="bulkMediaSelect(index)" />
                <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                        <q-spinner color="primary" size="3em" :thickness="2"/>
                    </div>
                </template>
            </q-infinite-scroll>
            <q-scroll-area class="full-height col-3" v-if="popup && hasSelectedFiles">
                <MediaDetailsPane v-model="currentFile" />
            </q-scroll-area>
        </div>
        <MediaDetailsDialog v-if="currentFile && !popup" v-model="showDetails" :file="currentFile" @previous="moveIndex(-1)" @next="moveIndex(1)" />
    </div>
</template>

<script lang="ts">
import { QInfiniteScroll } from 'quasar';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { cloneDeep, get } from 'lodash';
import ContentType from 'src/model/interfaces/ContentType';
import MediaFile from 'src/model/interfaces/MediaFile';
import MediaDetailsDialog from './MediaDetailsDialog.vue';
import MediaDetailsPane from './MediaDetailsPane.vue';
import MediaThumbnail from './MediaThumbnail.vue';

const ContentStore = namespace('Content');
const ContentTypeStore = namespace('ContentType');
const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: { MediaThumbnail, MediaDetailsDialog, MediaDetailsPane },
})
export default class MediaExplorer extends Vue {
    @MediaLibraryStore.State private selectedFiles;
    @MediaLibraryStore.State private callback;
    @MediaLibraryStore.State private isDetailsPaneOpen;
    @MediaLibraryStore.Action private cancelSelection;
    @MediaLibraryStore.Action private deleteSelection;
    @MediaLibraryStore.Action private selectFile;
    @MediaLibraryStore.Action private bulkSelect;
    @MediaLibraryStore.Action private setDetailsPaneOpen;
    @ContentStore.State private contentEntities;
    @ContentStore.State private contentEntitiesCount;
    @ContentStore.Action private fetchPage;
    @ContentStore.Action private reset;
    @ContentStore.Action private saveEntity;
    @ContentTypeStore.Getter private findByName;

    @Prop({type: Boolean, default: false})
    private multiple: boolean;

    @Prop({type: Boolean, default: false})
    private popup: boolean;

    @Prop({type: String, default: ''})
    private filter: string;

    @Ref('infiniteScroll')
    private infiniteScroll: QInfiniteScroll;

    private isSelectMultipleMode = false;
    private firstIndex = 0;
    private isRequesting = false;
    private pagesRequested: number[] = [];
    private _currentFile: MediaFile;

    private pagination = {
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0,
    };

    private activated() {
        this.search();
    }

    private resetData() {
        this.reset('media_file');
        this.pagesRequested.splice(0, this.pagesRequested.length);
        this.pagination = {
            sortBy: 'createdAt',
            descending: true,
            page: 1,
            rowsPerPage: 20,
            rowsNumber: 0,
        };
    }

    @Watch('filter')
    private search() {
        this.resetData();
        this.infiniteScroll?.reset();
        this.infiniteScroll?.trigger();
        this.infiniteScroll?.resume();
    }

    private onLoad(index, done) {
        if (!this.pagesRequested.includes(this.pagination.page)) {
            this.fetch().then(() => {
                done(this.pagination.page++ >= Math.ceil(this.pagination.rowsNumber / this.pagination.rowsPerPage));
            }).catch(() => {
                done(true);
            });
        }
    }

    private fetch(): Promise<void> {
        if (this.contentType) {
            return this.onRequest({
                pagination: this.pagination,
                filter: this.filter,
            });
        }

        return Promise.reject();
    }

    private async onRequest(props): Promise<void> {
        if (this.isRequesting || this.pagesRequested.includes(this.pagination.page)) {
            return;
        }

        this.isRequesting = true;
        this.pagesRequested.push(this.pagination.page);

        const { page, rowsPerPage, sortBy, descending } = props.pagination;
        const fetchCount = rowsPerPage === 0 ? '' : rowsPerPage;
        const startRow = (page - 1) * rowsPerPage;
        const filter = this.filter;

        await this.fetchPage({type: this.contentType, startRow, fetchCount, filter, sortBy, descending, status: 'publish', append: true});

        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagination.rowsNumber = this.filesCount();

        this.isRequesting = false;
    }

    private get contentType(): ContentType {
        return this.findByName('media_file');
    }

    private cancelMediaSelection() {
        this.firstIndex = 0;
        this.cancelSelection();
    }

    private async deleteMediaSelection() {
        await this.deleteSelection();
        this.cancelSelection();
    }

    private setBulkSelectFirstIndex(index: number) {
        if (!this.multiple && this.popup) {
            const isToggle = !!this.selectedFiles.find((f) => f.id === this.files[index].id);
            this.cancelSelection();

            if (!isToggle) {
                this.selectFile(this.files[index]);
            }
        } else if (this.isSelectMultipleMode) {
            this.selectFile(this.files[index]);
        } else {
            this.showDetails = true;
        }

        this.firstIndex = index;
    }

    private moveIndex(increment: number) {
        const newIndex: number = this.firstIndex + increment;

        if (newIndex < this.files.length && newIndex >= 0) {
            this.firstIndex += increment;
        } else if (increment > 0) {
            this.firstIndex = increment - 1;
        } else {
            this.firstIndex = this.files.length + increment;
        }
    }

    private bulkMediaSelect(index: number) {
        if (this.multiple) {
            this.bulkSelect({first: this.firstIndex, last: index});
        }
    }

    private get currentFile(): MediaFile {
        this._currentFile = cloneDeep(this.files[this.firstIndex]);
        return this._currentFile;
    }

    private set currentFile(value: MediaFile) {
        this._currentFile = value;
        this.saveEntity(this._currentFile);
    }

    private get hasSelectedFiles(): boolean {
        return this.selectedFiles.length > 0;
    }

    private get files(): MediaFile[] {
        return get(this.contentEntities, 'media_file', []);
    }

    private filesCount(): number {
        return get(this.contentEntitiesCount, 'media_file', 0);
    }

    private get hasCallback(): boolean {
        return typeof this.callback === 'function';
    }

    private onSelectMultipleModeChange(value) {
        if (!value) {
            this.cancelSelection();
        }
    }

    private get showDetails(): boolean {
        return this.isDetailsPaneOpen;
    }

    private set showDetails(value: boolean) {
        this.setDetailsPaneOpen(value);

        if (value) {
            this.isSelectMultipleMode = true;
        } else if (this.selectedFiles.length <= 1) {
            this.isSelectMultipleMode = false;
        }
    }
}
</script>
