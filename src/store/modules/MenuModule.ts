/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { uid } from 'quasar';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import ContentType from 'src/model/interfaces/ContentType';
import Menu from 'src/model/interfaces/Menu';
import PaginatedContentEntities from 'src/model/interfaces/PaginatedContentEntities';
import { setMenuItemsUid } from 'src/store/helpers/setMenuItemsUid';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import { axios, Routing } from 'src/utils/routing';

@Module({ namespaced: true })
export default class MenuModule extends VuexModule {
    public menus: Menu[] = [];
    public selectedMenu: Menu|null = null;
    public isLoading = false;
    private paginatedContentEntities: { [type: string]: PaginatedContentEntities } = {};

    @Action
    public async queryMenus() {
        this.context.commit('START_QUERY_MENUS');

        if (this.menus.length === 0) {
            const response = await axios.get(Routing.generate('numbernine_admin_menus_get_collection'));
            this.context.commit('SET_MENUS', response.data);
        }
    }

    @Action
    public async addMenu(menuName) {
        const response = await axios.post(Routing.generate('numbernine_admin_menus_post_item'), {name: menuName});
        this.context.commit('ADD_NEW_MENU', response.data);
    }

    @Action
    public selectMenu(menu: Menu) {
        this.context.commit('SELECT_MENU', menu);
    }

    @Action
    public async queryEntitiesForMenu({contentType, page}) {
        const response = await axios.get(Routing.generate('numbernine_admin_menus_get_entities', {type: contentType, page}));
        this.context.commit('SET_ENTITIES', {type: contentType, page, pagination: response.data});
    }

    @Action
    public async updateSelectedMenu(menuItems) {
        const purify = (menuItem) => {
            delete menuItem['uid'];
            delete menuItem['collapsed'];
            menuItem.children && menuItem.children.map(purify);
            return menuItem;
        }
        const purifiedMenuItems = menuItems.map(purify);
        await axios.post(Routing.generate('numbernine_admin_menus_set_menu_items', {id: this.selectedMenu?.id}), {menuItems: purifiedMenuItems});
    }

    @Mutation
    public START_QUERY_MENUS() {
        this.isLoading = true;
    }

    @Mutation
    public SET_MENUS(menus) {
        this.isLoading = false;
        this.menus = menus.map((menu) => {
            if (!Array.isArray(menu.menuItems)) {
                menu.menuItems = [];
            }

            menu.menuItems = setMenuItemsUid(menu.menuItems);
            return menu;
        });
    }

    @Mutation
    public ADD_NEW_MENU(menu: Menu) {
        this.menus.push(menu);
    }

    @Mutation
    public SELECT_MENU(menu: Menu) {
        this.selectedMenu = menu;
    }

    @Mutation
    public SET_ENTITIES({type, page, pagination}) {
        if (!this.paginatedContentEntities.hasOwnProperty(type)) {
            this.paginatedContentEntities[type] = {
                collection: {
                    [page]: pagination.collection,
                },
                totalItems: pagination.totalItems,
                totalPages: pagination.page.totalPages,
            };
        } else {
            this.paginatedContentEntities[type].collection[page] = pagination.collection;
        }
    }

    public get getContentEntitiesOfType() {
        return ({contentType, page}): ContentEntity[] => {
            if (!this.paginatedContentEntities.hasOwnProperty(contentType)) {
                return [];
            }

            return this.paginatedContentEntities[contentType].collection[page] ?? [];
        }
    }

    public get getMaxPagesOfType() {
        return (contentType: string): number => {
            if (!this.paginatedContentEntities.hasOwnProperty(contentType)) {
                return 1;
            }

            return this.paginatedContentEntities[contentType].totalPages ?? 1;
        }
    }

    public get getContentEntityById() {
        return (id: number): ContentEntity | null => {
            let found = false;
            let entity = null;

            Object.keys(this.paginatedContentEntities).forEach((contentType) => {
                if (found) {
                    return;
                }

                Object.keys(this.paginatedContentEntities[contentType].collection).forEach((page) => {
                    if (found) {
                        return;
                    }

                    const e = this.paginatedContentEntities[contentType].collection[page].find((e) => e.id === id);

                    if (e) {
                        entity = e;
                        found = true;
                    }
                });
            });

            return entity;
        }
    }
}
