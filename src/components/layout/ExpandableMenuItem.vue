<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-expansion-item expand-separator :icon="menuItem.icon" :label="menuItem.text" expand-icon-class="text-white" dense-toggle :default-opened="isExpanded">
        <MenuItem v-for="(child, slug) in menuItem.children" :key="slug" :menu-item="child" child dense></MenuItem>
    </q-expansion-item>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AdminMenuItem from 'src/model/interfaces/AdminMenuItem';
import MenuItem from './MenuItem.vue';

@Component({
    components: { MenuItem },
})
export default class extends Vue {
    @Prop()
    private menuItem: AdminMenuItem;

    private get isExpanded(): boolean {
        return Object.values(this.menuItem.children).find((i) => i.link === this.$route.fullPath) !== undefined;
    }
}
</script>
