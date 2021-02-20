/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Preset from 'src/model/interfaces/Preset';
import { ViewSize } from 'src/model/types/ViewSize';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { EventBus } from 'src/event/EventBus';
import Point2D from 'src/model/interfaces/Point2D';
import { DropPosition } from 'src/model/types/DropPosition';
import pageBuilderCompiler from 'src/services/PageBuilderCompiler';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import PageComponent, { Direction } from 'src/model/interfaces/PageComponent';
import Form from 'src/model/interfaces/Form';
import { axios, Routing } from 'src/utils/routing';
import { prepareTree } from '../helpers/prepareTree';
import { duplicateComponentInTree } from '../helpers/duplicateComponentInTree';
import { insertComponentInTree } from '../helpers/insertComponentInTree';
import { removeComponentInTree } from '../helpers/removeComponentInTree';
import { uid } from 'quasar';

@Module({namespaced: true})
export default class PageBuilderModule extends VuexModule {
    public currentEntity: ContentEntity | null = null;
    public pageComponents: PageComponent[] = [];
    public pageComponentForms: { [componentName: string]: Form[] } = {};
    public availablePageComponents: { [componentName: string]: PageComponent } = {};
    public componentPresets: { [componentName: string]: Preset[] } = {};
    public highlightedId: string | null = null;
    public selectedId: string | null = null;
    public dragId: string | null = null;
    public dropPosition: DropPosition | null = null;
    public isLoading = false;
    public isContextMenuVisible = false;
    public isSlideDragging = false;
    public slideDraggingOriginValue = 0;
    public slideDraggingOriginPosition: Point2D | undefined = undefined;
    public viewSize: ViewSize = 'lg';

    @Action
    public async fetchEntity({type, id}): Promise<void> {
        const entity = await this.context.dispatch('Content/fetchById', {type, id}, {root: true});
        this.context.commit('FETCH_ENTITY_SUCCESS', entity);
    }

    @Action
    public async fetchNewEntity(type): Promise<void> {
        const entity = await this.context.dispatch('Content/fetchNew', type, {root: true});
        this.context.commit('FETCH_ENTITY_SUCCESS', entity);
        return entity;
    }

    @Action
    public async fetchComponentsForCurrentEntity(): Promise<void> {
        if (!this.currentEntity) {
            return;
        }

        const response = await axios.get(Routing.generate('numbernine_admin_pagebuilder_entity_get_components', {id: this.currentEntity.id}));
        this.context.commit('FETCH_COMPONENTS_SUCCESS', response.data);
    }

    @Action
    public async fetchComponentsForArea(area: string): Promise<void> {
        const response = await axios.get(Routing.generate('numbernine_admin_pagebuilder_area_get_components', {area}));
        this.context.commit('FETCH_COMPONENTS_SUCCESS', response.data);
    }

    @Action
    public async fetchPresets(name): Promise<void> {
        if (!this.componentPresets.hasOwnProperty(name)) {
            const response = await axios.get(Routing.generate('numbernine_admin_page_builder_shortcode_get_presets', {name}));
            this.context.commit('UPDATE_COMPONENT_PRESETS', {name, presets: response.data});
        }
    }

    @Action
    public stopLoading(): void {
        this.context.commit('STOP_LOADING');
    }

    @Action
    public setHighlightedId(id: string | null): void {
        this.context.commit('SET_HIGHLIGHTED_ID', id);
    }

    @Action
    public setSelectedId(id: string | null): void {
        this.context.commit('SET_SELECTED_ID', id);
    }

    @Action
    public setSlideDragging(isDragging: boolean): void {
        this.context.commit('SET_SLIDE_DRAGGING', isDragging);
    }

    @Action
    public setSlideDraggingOriginPosition(position: Point2D | undefined): void {
        this.context.commit('SET_SLIDE_DRAGGING_ORIGIN_POSITION', position);
    }

    @Action
    public setSlideDraggingOriginValue(value: string): void {
        this.context.commit('SET_SLIDE_DRAGGING_ORIGIN_VALUE', value);
    }

    @Action
    public setDragId(id: string | null): void {
        this.context.commit('SET_DRAG_ID', id);

        if (id !== null) {
            this.context.commit('SET_CONTEXT_MENU_VISIBILITY', false);
        }
    }

    @Action
    public setDropPosition(position: DropPosition | null): void {
        this.context.commit('SET_DROP_POSITION', position);
    }

    @Action
    public toggleContextMenu(): void {
        this.context.commit('SET_CONTEXT_MENU_VISIBILITY', !this.isContextMenuVisible);
    }

    @Action
    public showContextMenu(): void {
        this.context.commit('SET_CONTEXT_MENU_VISIBILITY', true);
    }

    @Action
    public hideContextMenu(): void {
        this.context.commit('SET_CONTEXT_MENU_VISIBILITY', false);
    }

    @Action
    public insertComponent({componentToInsert, siblingId, position}): void {
        this.context.commit('INSERT_COMPONENT', {componentToInsert, siblingId, position});
    }

    @Action
    public moveComponent({componentToMoveId, siblingId, position}): void {
        const componentToMove = this.context.getters['getComponentById'](componentToMoveId);
        this.context.commit('MOVE_COMPONENT', {componentToMove, siblingId, position});
    }

    @Action
    public duplicateComponent(id): void {
        const componentToDuplicate = this.context.getters['getComponentById'](id);
        this.context.commit('DUPLICATE_COMPONENT', componentToDuplicate);
    }

    @Action
    public deleteComponent(id): void {
        const componentToRemove = this.context.getters['getComponentById'](id);

        if (id === this.selectedId) {
            this.context.commit('SET_SELECTED_ID', null);
        }

        if (componentToRemove) {
            this.context.commit('DELETE_COMPONENT', componentToRemove);
        }
    }

    @Action
    public setPageComponents(components: PageComponent[]): void {
        this.context.commit('SET_PAGE_COMPONENTS', components);
    }

    @Action
    public async publish(payload): Promise<void> {
        if (this.currentEntity && payload.hasOwnProperty('id')) {
            await axios.post(Routing.generate('numbernine_admin_pagebuilder_post_entity_components', {id: payload.id}), {components: this.pageComponents});
        } else if (payload.hasOwnProperty('area')) {
            await axios.post(Routing.generate('numbernine_admin_pagebuilder_post_area_components', {area: payload.area}), {components: this.pageComponents});
        }
    }

    @Action
    public updateComponentParameter({id, parameter, value, merge}): void {
        const component = this.context.getters['getComponentById'](id);
        this.context.commit('UPDATE_COMPONENT_PARAMETER', {component, parameter, value, merge});
    }

    @Action
    public updateComponentComputedParameter({id, parameter, value}): void {
        const component = this.context.getters['getComponentById'](id);
        this.context.commit('UPDATE_COMPONENT_COMPUTED_PARAMETER', {component, parameter, value});
    }

    @Action
    public async saveShortcodePreset(payload): Promise<void> {
        await axios.post(Routing.generate('numbernine_admin_page_builder_shortcode_post_presets', {name: payload.name}), payload.content);
        this.context.commit('ADD_COMPONENT_PRESET', {name: payload.name, component: payload.content});
    }

    @Action
    public setViewSize(size: ViewSize): void {
        this.context.commit('SET_VIEW_SIZE', size);
    }

    @Mutation
    public FETCH_ENTITY_START(): void {
        Vue.set(this, 'isLoading', true);
    }

    @Mutation
    public FETCH_ENTITY_SUCCESS(entity: ContentEntity): void {
        Vue.set(this, 'currentEntity', entity);
    }

    @Mutation
    public FETCH_COMPONENTS_SUCCESS({tree, templates, controls, components}): void {
        if (tree.length === 0) {
            tree.push(new class implements PageComponent {
                public id = uid();
                public name = 'text';
                public parameters = {content: 'Add a new component to this page...'};
                public computed = [];
                public position = 0;
                public label = 'Text';
                public children = [];
                public parentId = undefined;
                public siblingsPosition = ['top' as Direction, 'bottom' as Direction];
                public siblingsShortcodes = [];
                public icon = 'text_fields';
                public editable = false;
                public container = false;
                public responsive = [];
            });
        }

        prepareTree(tree);

        Vue.set(this, 'pageComponents', tree);
        Vue.set(this, 'pageComponentForms', controls);
        Vue.set(this, 'availablePageComponents', components);

        for (const template in templates) {
            if (templates.hasOwnProperty(template)) {
                pageBuilderCompiler.compileComponent(template, templates[template]);
            }
        }

        EventBus.emit('PageBuilder:components:loaded');
    }

    @Mutation
    public STOP_LOADING(): void {
        Vue.set(this, 'isLoading', false);
    }

    @Mutation
    public SET_HIGHLIGHTED_ID(id: string | null): void {
        Vue.set(this, 'highlightedId', id);
    }

    @Mutation
    public SET_SELECTED_ID(id: string | null): void {
        Vue.set(this, 'selectedId', id);
    }

    @Mutation
    public SET_DRAG_ID(id: string | null): void {
        Vue.set(this, 'dragId', id);
    }

    @Mutation
    public SET_SLIDE_DRAGGING(isDragging: boolean): void {
        Vue.set(this, 'isSlideDragging', isDragging);
    }

    @Mutation
    public SET_SLIDE_DRAGGING_ORIGIN_POSITION(position: Point2D | undefined): void {
        Vue.set(this, 'slideDraggingOriginPosition', position);
    }

    @Mutation
    public SET_SLIDE_DRAGGING_ORIGIN_VALUE(value: number): void {
        Vue.set(this, 'slideDraggingOriginValue', value);
    }

    @Mutation
    public SET_DROP_POSITION(position: DropPosition | null): void {
        Vue.set(this, 'dropPosition', position);
    }

    @Mutation
    public SET_CONTEXT_MENU_VISIBILITY(show: boolean): void {
        Vue.set(this, 'isContextMenuVisible', show);
    }

    @Mutation
    public INSERT_COMPONENT({componentToInsert, siblingId, position}): void {
        insertComponentInTree(this.pageComponents, siblingId, componentToInsert, position);
    }

    @Mutation
    public MOVE_COMPONENT({componentToMove, siblingId, position}): void {
        this.pageComponents = removeComponentInTree(this.pageComponents, componentToMove.id);
        insertComponentInTree(this.pageComponents, siblingId, componentToMove, position);
    }

    @Mutation
    public DUPLICATE_COMPONENT(componentToDuplicate): void {
        duplicateComponentInTree(this.pageComponents, componentToDuplicate);
    }

    @Mutation
    public DELETE_COMPONENT(componentToRemove): void {
        this.pageComponents = removeComponentInTree(this.pageComponents, componentToRemove.id);
    }

    @Mutation
    public SET_PAGE_COMPONENTS(components: PageComponent[]): void {
        Vue.set(this, 'pageComponents', components);
    }

    @Mutation
    public UPDATE_COMPONENT_PARAMETER({component, parameter, value, merge}): void {
        if (merge) {
            value = Object.assign({}, component.parameters[parameter], value);
        }

        Vue.set(component.parameters, parameter, value);
    }

    @Mutation
    public UPDATE_COMPONENT_COMPUTED_PARAMETER({component, parameter, value}): void {
        Vue.set(component.computed, parameter, value);
    }

    @Mutation
    public UPDATE_COMPONENT_PRESETS({name, presets}): void {
        Vue.set(this.componentPresets, name, presets);
    }

    @Mutation
    public ADD_COMPONENT_PRESET({name, component}): void {
        if (!this.componentPresets.hasOwnProperty(component.name)) {
            Vue.set(this.componentPresets, component.name, []);
        }

        this.componentPresets[component.name].splice(this.componentPresets[component.name].length, 0, {
            name,
            components: [component]
        });
    }

    @Mutation
    public SET_VIEW_SIZE(size: ViewSize): void {
        this.viewSize = size;
    }

    public get getComponentById(): (id: string, components?: PageComponent[]) => (PageComponent | undefined) {
        return (id: string, components?: PageComponent[]): (PageComponent | undefined) => {
            if (!components) {
                components = this.pageComponents;
            }

            for (const component of components) {
                if (component.id === id) {
                    return component;
                }

                if (component.hasOwnProperty('children') && component.children.length > 0) {
                    const found = this.getComponentById(id, component.children);

                    if (found) {
                        return found;
                    }
                }
            }

            return undefined;
        }
    }

    public get getComponentAncestors(): (component: PageComponent | undefined) => (PageComponent[]) {
        return (component: PageComponent | undefined): PageComponent[] => {
            if (!component) {
                return [];
            }

            const ancestors: PageComponent[] = [];
            const parent = this.context.getters['getComponentParent'](component);

            if (parent) {
                ancestors.push(...this.context.getters['getComponentAncestors'](parent), parent);
            }

            return ancestors;
        }
    }

    public get getComponentParent(): (component: PageComponent | undefined) => PageComponent | undefined {
        return (component: PageComponent | undefined): PageComponent | undefined => {
            if (!component || !component.parentId) {
                return undefined;
            }

            return this.context.getters['getComponentById'](component.parentId);
        }
    }
}
