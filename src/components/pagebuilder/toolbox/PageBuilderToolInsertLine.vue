<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-insert-line" v-show="active" :style="styles()">
        <div class="n9-line" :class="position ? 'n9-' + position : null"></div>
    </div>
</template>

<script lang="ts">
import { EventBus } from 'src/event/EventBus';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PageComponent from 'src/model/interfaces/PageComponent';
import { DropPosition } from 'src/model/types/DropPosition';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderToolInsertLine extends Vue {
    @PageBuilderStore.State private dragId;
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.Action private setDragId;
    @PageBuilderStore.Action private setSelectedId;
    @PageBuilderStore.Action private setHighlightedId;
    @PageBuilderStore.Action private setDropPosition;
    @PageBuilderStore.Getter private getComponentById;
    @PageBuilderStore.Getter private getComponentAncestors;

    @Prop()
    private mouseCoordinates: any;

    @Prop({type: Boolean, default: false})
    private mouseIn: boolean;

    private rect: {x: number, y: number, width: number, height: number} = {x: 0, y: 0, width: 0, height: 0};

    private created() {
        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
        EventBus.on('Frame:resize', () => (this.$forceUpdate()));
    }

    private get iFrameDocument(): Document {
        return (document.getElementById('page-builder-content-frame')!.querySelector('iframe') as HTMLIFrameElement).contentWindow!.document;
    }

    private styles() {
        const styles: any = {};

        const element = this.iFrameDocument.querySelector(`[data-component-id='${this.highlightedId}']`);

        if (element) {
            const rect = element.getBoundingClientRect();
            const scrollLeft = this.iFrameDocument.documentElement.scrollLeft;
            const scrollTop = this.iFrameDocument.documentElement.scrollTop;

            this.rect.width = rect.right - rect.left;
            this.rect.height = rect.bottom - rect.top;
            this.rect.x = rect.left;
            this.rect.y = rect.top;

            styles.width = `${this.rect.width}px`;
            styles.height = `${this.rect.height}px`;
            styles.transform = `translateX(${this.rect.x + scrollLeft}px) translateY(${this.rect.y + scrollTop}px)`;
        }

        return styles;
    }

    private get active(): boolean {
        return this.mouseIn && !!this.position;
    }

    private get highlightedComponent(): PageComponent | undefined {
        return this.getComponentById(this.highlightedId);
    }

    private get draggedComponent(): PageComponent | undefined {
        return this.getComponentById(this.dragId);
    }

    private get toleranceX(): number {
        return Math.min(this.rect.width / 4, 100);
    }

    private get toleranceY(): number {
        return Math.min(this.rect.height / 4, 100);
    }

    private get position(): string | null {
        let position: DropPosition | null = null;

        if (!(this.draggedComponent && !this.supportsDraggedComponent())) {
            if (Math.abs(this.rect.x - this.mouseCoordinates.x) < this.toleranceX && this.supportsHighlightedPosition('left')) {
                position = 'left';
            }

            if (Math.abs(this.rect.x + this.rect.width - this.mouseCoordinates.x) < this.toleranceX && this.supportsHighlightedPosition('right')) {
                position = 'right';
            }

            if (Math.abs(this.rect.y - this.mouseCoordinates.y) < this.toleranceY && this.supportsHighlightedPosition('top')) {
                position = 'top';
            }

            if (Math.abs(this.rect.y + this.rect.height - this.mouseCoordinates.y) < this.toleranceY && this.supportsHighlightedPosition('bottom')) {
                position = 'bottom';
            }
        }

        this.setDropPosition(position);

        return position;
    }

    private supportsHighlightedPosition(position: DropPosition): boolean {
        return this.highlightedComponent ? this.highlightedComponent.siblingsPosition.includes(position) : false;
    }

    private supportsDraggedComponent(): boolean {
        if (this.dragId === this.highlightedId) {
            return false;
        }

        if (this.draggedComponent && this.highlightedComponent) {
            if (this.highlightedComponent.siblingsShortcodes.length === 0) {
                if (this.draggedComponent.siblingsShortcodes.length === 0) {
                    return true;
                } else {
                    return this.draggedComponent.siblingsShortcodes.includes(this.highlightedComponent.name);
                }
            }

            return this.highlightedComponent.siblingsShortcodes.includes(this.draggedComponent.name);
        }

        return false;
    }
}
</script>
