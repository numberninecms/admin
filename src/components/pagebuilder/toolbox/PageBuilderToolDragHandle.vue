<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-drag-handle" v-show="active" :style="styles()">
        <h3>
            <span>{{ label }}</span>
        </h3>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'quasar';
import { EventBus } from 'src/event/EventBus';
const { capitalize } = format;
import PageComponent from '../../../model/interfaces/PageComponent';
import Point2D from 'src/model/interfaces/Point2D';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderToolDragHandle extends Vue {
    @PageBuilderStore.State private dragId;
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.State private dropPosition;
    @PageBuilderStore.Action private setDragId;
    @PageBuilderStore.Action private setSelectedId;
    @PageBuilderStore.Action private moveComponent;
    @PageBuilderStore.Action private setHighlightedId;
    @PageBuilderStore.Getter private getComponentById;
    @PageBuilderStore.Getter private getComponentAncestors;

    @Prop()
    private mouseCoordinates: Point2D;

    private created() {
        EventBus.on('Frame:loaded', () => {
            this.iFrameDocument.querySelector('body')!.onmouseup = () => {
                if (this.highlightedComponent && this.component && this.dropPosition) {
                    this.moveComponent({componentToMoveId: this.dragId, siblingId: this.highlightedComponent.id, position: this.dropPosition});
                    EventBus.emit('PageBuilder:move-component-after');
                }

                this.setDragId(null);
            };
        });

        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
        EventBus.on('Frame:resize', () => (this.$forceUpdate()));
    }

    private get iFrameDocument(): Document {
        return (document.getElementById('page-builder-content-frame')!.querySelector('iframe') as HTMLIFrameElement).contentWindow!.document;
    }

    private styles() {
        return {transform: `translate3d(${this.mouseCoordinates.x}px, ${this.mouseCoordinates.y}px, 0px)`};
    }

    private get active(): boolean {
        return !!this.dragId;
    }

    private get label(): string {
        return this.component ? capitalize(this.component.name) : '';
    }

    private get component(): PageComponent | undefined {
        return this.getComponentById(this.dragId);
    }

    private get highlightedComponent(): PageComponent | undefined {
        return this.getComponentById(this.highlightedId);
    }
}
</script>
