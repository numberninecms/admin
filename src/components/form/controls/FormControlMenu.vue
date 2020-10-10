<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="row q-col-gutter-md relative-position q-mt-lg items-center">
        <div class="absolute ellipsis control-label">
            {{ parameters.label }}
        </div>
        <q-select label="Select a menu to edit"
                  :options="menus"
                  option-label="name"
                  option-value="id"
                  :display-value="selectedMenuName"
                  :value="value"
                  map-options
                  emit-value
                  @input="selectMenu"/>
    </div>
</template>
<script lang="ts">
import Menu from 'src/model/interfaces/Menu';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

const MenuStore = namespace('Menu');

@Component
export default class FormControlMenu extends Vue {
    @MenuStore.State private menus: Menu[];
    @MenuStore.Action private queryMenus;

    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private async created() {
        await this.queryMenus();

        if (this.value) {
            this.$emit('input-computed', {parameter: 'selectedMenuName', value: this.selectedMenuName});
        }
    }

    private selectMenu(value) {
        this.$emit('input', {parameter: 'id', value: value});
        this.$emit('input-computed', {parameter: 'selectedMenuName', value: this.getMenuById(value).name});
    }

    private getMenuById(id): Menu {
        return this.menus.find((menu) => menu.id === id) as Menu;
    }

    private get selectedMenuName() {
        const menu = this.getMenuById(this.value);
        return menu ? menu.name : 'Select a menu';
    }
}
</script>
