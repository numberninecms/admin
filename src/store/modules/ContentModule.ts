/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ContentTypePage from 'src/model/interfaces/ContentTypePage';
import GenericObject from 'src/model/interfaces/GenericObject';
import Revision from 'src/model/interfaces/Revision';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import PaginatedCollectionResponse from 'src/model/interfaces/PaginatedCollectionResponse';
import { axios, axiosGeneric, Routing } from 'src/utils/routing';

@Module({ namespaced: true })
export default class ContentModule extends VuexModule {
    public contentEntities: GenericObject<ContentEntity[]> = {};
    public contentEntitiesTemplates: GenericObject<string[]> = {};
    public contentEntitiesRevisions: GenericObject<GenericObject<Revision[]>> = {};
    public contentEntitiesCount: GenericObject<number> = {};
    public existingCustomFields: string[] = [];
    public pagesCount: GenericObject<number> = {};
    public isLoading: GenericObject<boolean> = {};

    @MutationAction({mutate: ['existingCustomFields']})
    public async fetchExistingCustomFields() {
        const response = await axios.get(Routing.generate('numbernine_admin_contententity_customfields_get_collection'));
        return {existingCustomFields: response.data};
    }

    @Action
    public async fetchPage(payload: ContentTypePage) {
        this.context.commit('FETCHING', payload);
        const response: PaginatedCollectionResponse<ContentEntity> = await axiosGeneric.getCollection<ContentEntity>(Routing.generate('numbernine_admin_contententity_get_collection', {
            type: payload.type.name,
            startRow: payload.startRow,
            fetchCount: payload.fetchCount,
            filter: payload.filter,
            orderBy: payload.sortBy,
            order: payload.descending ? 'desc' : 'asc',
            status: payload.status,
        }));
        this.context.commit('FETCHING_SUCCESS', { type: payload.type, data: response, append: payload.append });
    }

    @Action
    public async fetchAll({type, status, orderBy, order}) {
        const response = await axios.get(Routing.generate('numbernine_admin_contententity_get_collection', {type, status, orderBy, order}));
        this.context.commit('FETCHING_SUCCESS', { type: {name: type}, data: response.data, append: false });
    }

    @Action
    public async fetchById({type, id}) {
        const response = await axiosGeneric.getItem<ContentEntity>(Routing.generate('numbernine_admin_contententity_get_item', {type, id}));
        this.context.commit('ADD_ENTITY', response);
        return response;
    }

    @Action
    public async fetchFullById({type, id}) {
        const response = await axiosGeneric.getItem<ContentEntity>(Routing.generate('numbernine_admin_contententity_get_item', {type, id, full: true}));
        this.context.commit('ADD_ENTITY', response);
        return response;
    }

    @Action
    public async fetchByTitle({type, title}) {
        const response = await axiosGeneric.getItem<ContentEntity>(Routing.generate('numbernine_admin_contententity_get_item_by_title', {type, title}));
        this.context.commit('ADD_ENTITY', response);
        return response;
    }

    @Action
    public async fetchNew({type}) {
        const response = await axiosGeneric.getItem<ContentEntity>(Routing.generate('numbernine_admin_contententity_new_item', {type}));
        this.context.commit('ADD_ENTITY', response);
        return response;
    }

    @Action
    public async fetchTemplates(type) {
        if (!this.contentEntitiesTemplates.hasOwnProperty(type)) {
            const response = await axios.get(Routing.generate('numbernine_admin_contententity_templates_get_collection', {type}));
            this.context.commit('FETCH_TEMPLATES_SUCCESS', {type, templates: response.data});
        }

        return this.contentEntitiesTemplates[type];
    }

    @Action
    public async fetchContentEntityRevisions(entity: ContentEntity) {
        const response = await axios.get(Routing.generate('numbernine_admin_contententity_revisions_get_collection', {type: entity.type, id: entity.id}));
        this.context.commit('FETCH_REVISIONS_SUCCESS', {entity, revisions: response.data});
        return response.data;
    }

    @Action
    public async saveEntity(entity: ContentEntity): Promise<ContentEntity> {
        const response = await axios.put(Routing.generate('numbernine_admin_contententity_update_item', { type: entity.type, id: entity.id }), entity);
        this.context.commit('SAVING_SUCCESS', response.data);
        return response.data;
    }

    @Action
    public async deleteEntity(entity: ContentEntity): Promise<void> {
        await axios.delete(Routing.generate('numbernine_admin_contententity_delete_item', { type: entity.type, id: entity.id }));
        this.context.commit('DELETING_SINGLE_SUCCESS', entity);
    }

    @Action
    public async revertEntity({entity, version}): Promise<void> {
        const response = await axios.post(Routing.generate('numbernine_admin_contententity_revert_item', { type: entity.type, id: entity.id, version }));
        this.context.commit('REVERT_SUCCESS', response.data);
        return response.data;
    }

    @Action
    public async deleteEntities({type, entities}) {
        await axios.post(Routing.generate('numbernine_admin_contententity_delete_collection', { type: type.name }), { ids: entities.map((e) => e.id) });
        this.context.commit('DELETING_SUCCESS', {type, entities});
    }

    @Action
    public async restoreEntities({type, entities}) {
        await axios.post(Routing.generate('numbernine_admin_contententity_restore_collection', { type: type.name }), { ids: entities.map((e) => e.id) });
        this.context.commit('DELETING_SUCCESS', {type, entities});
    }

    @Action
    public addEntity(payload) {
        this.context.commit('ADD_ENTITY', payload);
    }

    @Action
    public reset(type) {
        this.context.commit('RESET', type);
    }

    @Mutation
    private RESET(type: string) {
        Vue.set(this.contentEntities, type, []);
        Vue.set(this.contentEntitiesCount, type, 0);
        Vue.set(this.pagesCount, type, 0);
        Vue.set(this.isLoading, type, false);
    }

    @Mutation
    private FETCHING(payload: ContentTypePage) {
        Vue.set(this.isLoading, payload.type.name, true);
    }

    @Mutation
    private FETCHING_SUCCESS(payload) {
        if (payload.append) {
            if (!this.contentEntities.hasOwnProperty(payload.type.name)) {
                Vue.set(this.contentEntities, payload.type.name, []);
            }
            this.contentEntities[payload.type.name].push(...payload.data.collection);
        } else {
            Vue.set(this.contentEntities, payload.type.name, payload.data.collection);
        }
        Vue.set(this.contentEntitiesCount, payload.type.name, payload.data.totalItems);
        Vue.set(this.pagesCount, payload.type.name, payload.data.page.totalPages);
        Vue.set(this.isLoading, payload.type.name, false);
    }

    @Mutation
    private SAVING_SUCCESS(entity: ContentEntity) {
        this.contentEntities[entity.type].splice(this.contentEntities[entity.type].findIndex((e) => e.id === entity.id), 1, entity);
    }

    @Mutation
    private REVERT_SUCCESS(entity: ContentEntity) {
        this.contentEntities[entity.type].splice(this.contentEntities[entity.type].findIndex((e) => e.id === entity.id), 1, entity);
    }

    @Mutation
    private DELETING_SUCCESS({type, entities}) {
        for (const entity of entities) {
            this.contentEntities[type.name].splice(this.contentEntities[type.name].findIndex((e) => e.id === entity.id), 1);
            this.contentEntitiesCount[type.name]--;
        }
    }

    @Mutation
    private DELETING_SINGLE_SUCCESS(entity) {
        this.contentEntities[entity.type].splice(this.contentEntities[entity.type].findIndex((e) => e.id === entity.id), 1);
        this.contentEntitiesCount[entity.type]--;
    }

    @Mutation
    public ADD_ENTITY(entity) {
        if (!this.contentEntities.hasOwnProperty(entity.type)) {
            Vue.set(this.contentEntities, entity.type, []);
        }

        const index = this.contentEntities[entity.type].findIndex((e) => e.id === entity.id);

        if (index !== -1) {
            this.contentEntities[entity.type].splice(index, 1, entity);
        } else {
            this.contentEntities[entity.type].unshift(entity);
        }

        this.contentEntitiesCount[entity.type]++;
    }

    @Mutation
    public FETCH_TEMPLATES_SUCCESS({type, templates}) {
        Vue.set(this.contentEntitiesTemplates, type, templates);
    }

    @Mutation
    public FETCH_REVISIONS_SUCCESS({entity, revisions}) {
        if (!this.contentEntitiesRevisions.hasOwnProperty(entity.type)) {
            Vue.set(this.contentEntitiesRevisions, entity.type, {});
        }

        Vue.set(this.contentEntitiesRevisions[entity.type], entity.id.toString(), revisions);
    }

    public get findById() {
        return (id: number) => {
            for (const type in this.contentEntities) {
                if (this.contentEntities.hasOwnProperty(type)) {
                    const entity = this.contentEntities[type].find((e) => e.id === id);

                    if (entity) {
                        return entity;
                    }
                }
            }

            return undefined;
        }
    }

    public get findByTitle() {
        return (title: string) => {
            for (const type in this.contentEntities) {
                if (this.contentEntities.hasOwnProperty(type)) {
                    const entity = this.contentEntities[type].find((e) => e.title === title);

                    if (entity) {
                        return entity;
                    }
                }
            }

            return undefined;
        }
    }
}
