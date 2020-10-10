<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div @mousemove="updateContextMenuOffset" ref="container">
        <q-sortable-tree v-if="tree.length > 0"
                         :nodes="tree"
                         :default-expand-all="true"
                         node-key="id"
                         :selected="selectedId"
                         @select="select"
                         @dblclick="edit"
                         @rightclick="showContextMenu"
                         @change="onTreeChange"
                         @mouseenter="highlight">
            <template v-slot:default-header="{node, labelKey}">
                <q-avatar v-if="node.avatar" class="q-mr-sm">
                    <img :src="node.avatar">
                </q-avatar>
                <q-icon v-if="node.icon" :name="node.icon" class="q-mr-sm"/>
                <div>
                    {{ node[labelKey] }}
                </div>
                <q-space v-if="node.parameters.visibility"/>
                <q-btn v-if="node.parameters.visibility"
                       flat dense
                       size="xs"
                       :color="node.parameters.visibility.includes(viewSize) ? 'green' : 'red'"
                       :icon="node.parameters.visibility.includes(viewSize) ? 'visibility' : 'visibility_off'"
                       @click="update(node)"
                       @dblclick.stop.prevent/>
            </template>
        </q-sortable-tree>

        <q-menu v-model="contextMenu"
                :offset="offset"
                v-close-popup
                context-menu>

            <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="duplicateAction = true">
                    <q-item-section>Duplicate</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="presetAction = true">
                    <q-item-section>Save as preset</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="shortcodeAction = true">
                    <q-item-section>Show shortcode</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteAction = true">
                    <q-item-section>Delete</q-item-section>
                </q-item>
            </q-list>

        </q-menu>

        <PageBuilderContextMenuActions :duplicate-action.sync="duplicateAction"
                                       :preset-action.sync="presetAction"
                                       :shortcode-action.sync="shortcodeAction"
                                       :delete-action.sync="deleteAction"/>
    </div>
</template>
<script lang="ts">
import PageBuilderContextMenuActions from 'components/pagebuilder/PageBuilderContextMenuActions.vue';
import { EventBus } from 'src/event/EventBus';
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { cloneDeep, isEqual } from 'lodash';
import PageComponent from 'src/model/interfaces/PageComponent';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: {PageBuilderContextMenuActions}
})
export default class PageBuilderComponentsTree extends Vue {
    @PageBuilderStore.State private pageComponents;
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private viewSize;
    @PageBuilderStore.Action private setPageComponents;
    @PageBuilderStore.Action private setHighlightedId;
    @PageBuilderStore.Action private setSelectedId;
    @PageBuilderStore.Action private toggleContextMenu;
    @PageBuilderStore.Action private duplicateComponent;
    @PageBuilderStore.Action private updateComponentParameter;

    @Ref('container')
    private container: HTMLDivElement;

    private tree: PageComponent[] = [];
    private contextMenu = false;
    private offset: number[] = [0, 0];

    private duplicateAction = false;
    private presetAction = false;
    private shortcodeAction = false;
    private deleteAction = false;

    @Watch('pageComponents', {deep: true})
    private updateTree(): PageComponent[] {
        return this.$set(this, 'tree', cloneDeep(this.pageComponents));
    }

    private onTreeChange(value) {
        if (!isEqual(this.pageComponents, value)) {
            this.setPageComponents(value);
        }
    }

    private updateContextMenuOffset(event) {
        if (!this.container) {
            return [0, 0];
        }

        const rect = this.container.getBoundingClientRect();

        this.offset = [
            -(event.pageX - rect.left),
            event.pageY - rect.top - rect.height,
        ];
    }

    private highlight(component: PageComponent) {
        this.setHighlightedId(component.id);
    }

    private select(component: PageComponent) {
        this.contextMenu = false;
        this.setSelectedId(component.id);
    }

    private edit(component: PageComponent) {
        if (component && this.selectedId === component.id) {
            this.$emit('edit', component.id);
        }
    }

    private showContextMenu(component: PageComponent) {
        this.contextMenu = false;
        this.select(component);
        this.$nextTick(() => this.contextMenu = true);
    }

    private async update(component: PageComponent) {
        const array = [...component.parameters.visibility];

        if (array.includes(this.viewSize)) {
            array.splice(array.indexOf(this.viewSize), 1);
        } else {
            array.push(this.viewSize);
        }

        await this.updateComponentParameter({id: component.id, parameter: 'visibility', value: array});
        this.$forceUpdate();
        EventBus.emit('PageBuilder:update-parameter-after');
    }
}
</script>
<style lang="scss">
.q-hoverable.highlighted > .q-focus-helper {
    background: currentColor;
    opacity: .15;
}
</style>
