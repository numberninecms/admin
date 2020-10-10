<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-insert-button" :style="styles()">
        <button :class="dropPosition ? 'n9-' + dropPosition : null"
                v-show="active"
                @click="addToContent">
            <i class="n9-fas n9-fa-plus"></i>
        </button>
    </div>
</template>

<script lang="ts">
import { EventBus } from 'src/event/EventBus';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderToolInsertButton extends Vue {
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.State private dropPosition;

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

    private get active(): boolean {
        return this.mouseIn && !!this.dropPosition;
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

    private addToContent() {
        EventBus.emit('PageBuilder:add-to-content', {element: this.highlightedId, position: this.dropPosition});
    }
}
</script>
