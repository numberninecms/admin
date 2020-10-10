<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page>
        <div class="q-ma-md row q-col-gutter-md" style="padding-top: 42px">
            <div class="col-md-2 col-sm-6 col-xs">
                <q-select label="Select a menu to edit" filled :options="menus" option-label="name" option-value="id" :value="selectedMenu" @input="selectCurrentMenu($event)" />
            </div>
            <div class="col-md-2 col-sm-6 col-xs">
                <q-input label="Add new menu" v-model="newMenu" filled>
                    <template v-slot:append>
                        <q-btn round dense flat icon="add" @click="addMenu(newMenu)" />
                    </template>
                </q-input>
            </div>
        </div>
        <div class="q-ma-md row q-col-gutter-md" v-if="selectedMenu">
            <div class="col-md-2 col-sm-4 col-xs">
                <q-expansion-item v-for="contentType in contentTypes"
                                  :key="contentType.name"
                                  :label="getLabel(contentType)"
                                  header-class="bg-secondary text-white"
                                  expand-icon-class="text-white"
                                  class="q-mb-xs"
                                  @click="loadEntities(contentType, 1)">
                    <div v-if="getEntitiesOfType(contentType, page[contentType.name]).length > 0">
                        <q-scroll-area style="height: 300px;">
                            <div class="q-pa-sm">
                                <q-pagination :value="page[contentType.name]"
                                              :max="getMaxPages(contentType)"
                                              :max-pages="5"
                                              color="secondary"
                                              :boundary-links="getMaxPages(contentType) > 5"
                                              @input="loadEntities(contentType, $event)"/>
                            </div>
                            <q-list dense>
                                <q-item tag="label" v-ripple v-for="entity in getEntitiesOfType(contentType, page[contentType.name])" :key="entity.id">
                                    <q-item-section side>
                                        <q-checkbox color="secondary" v-model="checked[entity.id]" :false-value="null" indeterminate-value="indeterminate" dense />
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label>{{ entity.title }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                            <div class="q-pa-sm q-pr-lg flex justify-end">
                                <q-btn label="Add to menu" dense color="secondary" @click="addSelectedToMenu()"/>
                            </div>
                        </q-scroll-area>
                    </div>
                </q-expansion-item>
            </div>
            <div class="col-md-8 col-sm-6 col-xs">
                <div class="text-h4">{{ selectedMenu.name }}</div>
                <q-sortable-tree :nodes="menuTrees[selectedMenu.id]" label-key="title" node-key="uid" :default-expand-all="true"/>
                <q-btn label="Save menu" color="primary" class="q-mt-lg" @click="saveMenu"/>
            </div>
        </div>
        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    Menus
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import * as changeCase from 'change-case';
import { uid } from 'quasar';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import ContentType from 'src/model/interfaces/ContentType';
import Menu from 'src/model/interfaces/Menu';
import MenuItem from 'src/model/interfaces/MenuItem';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { defaultsDeep } from 'lodash';

const ContentTypeStore = namespace('ContentType');
const MenuStore = namespace('Menu');

@Component
export default class MenuIndex extends Vue {
    @ContentTypeStore.State private contentTypes: ContentType[];
    @MenuStore.State private menus: Menu[];
    @MenuStore.State private selectedMenu: Menu;
    @MenuStore.Action private queryMenus;
    @MenuStore.Action private addMenu;
    @MenuStore.Action private selectMenu;
    @MenuStore.Action private queryEntitiesForMenu;
    @MenuStore.Action private updateSelectedMenu;
    @MenuStore.Getter private getContentEntitiesOfType;
    @MenuStore.Getter private getContentEntityById;
    @MenuStore.Getter private getMaxPagesOfType;

    private newMenu = '';
    private page: { [key: string]: number } = {};
    private checked: { [key: number]: boolean } = {};
    private menuTrees: { [id: number]: MenuItem[] } = {};

    private created() {
        this.queryMenus();
    }

    private selectCurrentMenu(menu: Menu) {
        this.selectMenu(menu);

        if (!this.menuTrees.hasOwnProperty(menu.id)) {
            this.$set(this.menuTrees, menu.id, [...defaultsDeep({}, menu).menuItems]);
        }
    }

    private getLabel(contentType: ContentType): string {
        return changeCase.capitalCase(contentType.labels.pluralName);
    }

    private async loadEntities(contentType: ContentType, page: number): Promise<void> {
        this.page[contentType.name] = page;

        if (this.getEntitiesOfType(contentType, page).length === 0) {
            await this.queryEntitiesForMenu({contentType: contentType.name, page});
        }

        this.$forceUpdate();
    }

    private getEntitiesOfType(contentType: ContentType, page: number): ContentEntity[] {
        return this.getContentEntitiesOfType({contentType: contentType.name, page});
    }

    private getMaxPages(contentType: ContentType) {
        return this.getMaxPagesOfType(contentType.name);
    }

    private addSelectedToMenu(): void {
        const selected = Object.keys(this.checked).filter((id) => this.checked[id]).map((id) => parseInt(id));
        const entities = selected.map((id) => this.getContentEntityById(id)).filter((entity) => entity !== null);

        this.menuTrees[this.selectedMenu.id].push(...entities.map((entity) => {
            return {
                uid: uid(),
                entityId: entity.id,
                title: entity.title,
                children: [],
            }
        }));

        this.checked = {};
    }

    private saveMenu(): void {
        this.updateSelectedMenu(this.menuTrees[this.selectedMenu.id]);
    }
}
</script>
