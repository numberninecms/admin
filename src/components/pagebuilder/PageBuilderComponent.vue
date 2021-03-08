<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <component v-if="!isLoading && (!component.parameters.visibility || component.parameters.visibility.includes(viewSize))"
               :is="dynamicComponentName"
               :self-instance="component"
               :parameters="component.parameters"
               :responsive="component.responsive"
               :computed="component.computed"
               :view-size="viewSize"
               :children="component.children"
               :data-component-id="component.id"
               class="n9-page-builder-component"
               :class="{'n9-dragging': isDragging}"
               @update-children="component.children = $event"
               @mouseover.native.stop="highlight"
               @mousedown.native.stop="mouseDown"
               @mouseup.native="mouseUp"
               @mousemove.native="mouseMove"
               @click.native.prevent.stop="select"
               @dblclick.native.stop="edit"/>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { EventBus } from 'src/event/EventBus';
import PageComponent from 'src/model/interfaces/PageComponent';
import * as changeCase from 'change-case';
import { namespace } from 'vuex-class';
import preload from 'src/utils/preload';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderComponent extends Vue {
    @PageBuilderStore.Action private setHighlightedId;
    @PageBuilderStore.Action private setSelectedId;
    @PageBuilderStore.Action private setDragId;
    @PageBuilderStore.Action private hideContextMenu;
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.State private dragId;
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private isLoading;
    @PageBuilderStore.State private viewSize;

    @Prop()
    private component: PageComponent;

    private mouse: {down: boolean, move: boolean} = {down: false, move: false};

    private created() {
        preload(this.component);
    }

    private highlight() {
        if (!this.isHighlighted) {
            this.setHighlightedId(this.component.id);
        }
    }

    private select() {
        this.setSelectedId(this.component.id);
    }

    private get isHighlighted(): boolean {
        return this.highlightedId === this.component.id;
    }

    private get isDragging(): boolean {
        return this.dragId === this.component.id;
    }

    private get dynamicComponentName(): string {
        return changeCase.pascalCase(this.component.name) + 'PageBuilderComponent';
    }

    private edit() {
        EventBus.emit('PageBuilder:edit-component');
    }

    private mouseDown() {
        this.mouse.down = true;
        this.hideContextMenu();
    }

    private mouseMove() {
        if (this.mouse.down) {
            this.mouse.move = true;
        } else {
            this.mouse.move = false;
        }
    }

    private mouseUp() {
        this.mouse.down = false;
        this.mouse.move = false;
    }

    private get detectDrag(): boolean {
        return this.mouse.down && this.mouse.move;
    }

    @Watch('detectDrag')
    private startDrag() {
        this.setDragId(this.detectDrag ? this.component.id : null);
    }

    @Watch('dragId')
    private onDragIdChanged(newValue, oldValue) {
        if (newValue === null && oldValue !== null) {
            this.mouse.down = false;
            this.mouse.move = false;
        }
    }
}
</script>
