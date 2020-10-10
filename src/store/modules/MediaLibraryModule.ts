/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import GenericObject from 'src/model/interfaces/GenericObject';
import MediaFile from 'src/model/interfaces/MediaFile';
import MediaLibraryOptions from 'src/model/interfaces/MediaLibraryOptions';
import MediaSettings from 'src/model/interfaces/MediaSettings';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';
import { axios, Routing } from 'src/utils/routing';
import { size } from 'lodash';

@Module({ namespaced: true })
export default class MediaLibraryModule extends VuexModule {
    public selectedFiles: MediaFile[] = [];
    public options: GenericObject<any> = {};
    public isLoading = false;
    public isShown = false;
    public isDetailsPaneOpen = false;
    public callback: any = null;
    public libraryOptions: MediaLibraryOptions = {};
    public mediaSettings: MediaSettings = { size: 'medium', alignment: 'center', link: 'media', linkUrl: ''};

    @MutationAction({mutate: ['mediaSettings']})
    public async updateMediaSettings(settings: MediaSettings) {
        return {mediaSettings: settings};
    }

    @Action
    public async fetchOptions(force: boolean) {
        if (force || size(this.options) === 0) {
            const response = await axios.get(Routing.generate('numbernine_admin_media_files_get_options'));
            this.context.commit('FETCH_OPTIONS_SUCCESS', response.data);
        }
    }

    @Action
    public selectFile(file: MediaFile) {
        this.context.commit('SELECT_FILE', file);
    }

    @Action
    public cancelSelection() {
        this.context.commit('CANCEL_SELECTION');
    }

    @Action
    public async deleteSelection() {
        await this.context.dispatch('Content/deleteEntities', {type: this.context.rootGetters['ContentType/findByName']('media_file'), entities: this.selectedFiles}, {root: true});
    }

    @Action
    public bulkSelect({ first, last }) {
        const files = this.context.rootState.Content.contentEntities['media_file'].slice(first, last as number + 1);
        this.context.commit('BULK_SELECT', files);
    }

    @Action
    public show(payload) {
        this.context.commit('SHOW_MEDIA_LIBRARY', payload);
    }

    @Action
    public close() {
        this.context.commit('CLOSE_MEDIA_LIBRARY');
    }

    @Action
    public submit() {
        this.context.commit('SUBMIT_MEDIA_LIBRARY');
    }

    @Action
    public setDetailsPaneOpen(state: boolean) {
        this.context.commit('SUBMIT_SET_DETAILS_PANE_OPEN', state);
    }

    @Mutation
    public SELECT_FILE(file: MediaFile) {
        if (!this.selectedFiles.find((f) => f.id === file.id)) {
            this.selectedFiles.push(file);
        } else {
            this.selectedFiles.splice(this.selectedFiles.findIndex((f) => f.id === file.id), 1);
        }
    }

    @Mutation
    public CANCEL_SELECTION() {
        this.selectedFiles.splice(0, this.selectedFiles.length);
    }

    @Mutation
    public BULK_SELECT(files: MediaFile[]) {
        for (const file of files) {
            if (!this.selectedFiles.find((f) => f.id === file.id)) {
                this.selectedFiles.push(file);
            }
        }
    }

    @Mutation
    public SHOW_MEDIA_LIBRARY({ value, callback, options }) {
        this.isShown = value;
        this.callback = callback;
        this.libraryOptions = options;
    }

    @Mutation
    public CLOSE_MEDIA_LIBRARY() {
        this.isShown = false;
        this.callback = null;
        this.libraryOptions = {};
    }

    @Mutation
    public SUBMIT_MEDIA_LIBRARY() {
        this.isShown = false;

        if (this.callback) {
            this.callback(this.selectedFiles);
        }

        this.callback = null;
        this.libraryOptions = {};
    }

    @Mutation
    public FETCH_OPTIONS_SUCCESS(options) {
        Vue.set(this, 'options', options);
    }

    @Mutation
    public SUBMIT_SET_DETAILS_PANE_OPEN(state: boolean) {
        Vue.set(this, 'isDetailsPaneOpen', state);
    }

    public get isSelected() {
        return (file: MediaFile): boolean => {
            return !!this.selectedFiles.find((f) => f === file);
        };
    }
}
