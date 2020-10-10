<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-scroll-area class="fit">
        <q-list padding>
            <component :is="hasChildren(menuItem) ? 'ExpandableMenuItem' : 'MenuItem'" v-for="(menuItem, slug) in menuItems" :key="slug" :menu-item="menuItem" />
        </q-list>
    </q-scroll-area>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AdminMenuItem from 'src/model/interfaces/AdminMenuItem';
import { namespace } from 'vuex-class';
import ExpandableMenuItem from './ExpandableMenuItem.vue';
import MenuItem from './MenuItem.vue';

const LayoutStore = namespace('Layout');

@Component({
    components: { ExpandableMenuItem, MenuItem }
})
export default class NavLeft extends Vue {
    @LayoutStore.State private mainMenuItems;

    private get menuItems(): Record<string, AdminMenuItem[]> {
        return this.mainMenuItems;
    }

    private hasChildren(menuItem: AdminMenuItem): boolean {
        return Object.keys(menuItem.children).length > 0;
    }
}
</script>
