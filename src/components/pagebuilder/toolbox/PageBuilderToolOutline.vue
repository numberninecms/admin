<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-outline" :style="styles()" v-if="active">
        <div class="n9-wrapper">
            <h3>{{ label }}</h3>
        </div>
    </div>
</template>

<script lang="ts">
import { EventBus } from 'src/event/EventBus';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'quasar';
const { capitalize } = format;
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderToolOutline extends Vue {
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.Getter private getComponentById;

    @Prop({type: Boolean, default: false})
    private mouseIn: boolean;

    private created() {
        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
        EventBus.on('Frame:resize', () => (this.$forceUpdate()));
    }

    private get active(): boolean {
        return this.mouseIn && !!this.highlightedId;
    }

    private get label(): string {
        const component = this.getComponentById(this.highlightedId);
        return component ? capitalize(component.label) : '';
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

            styles.width = `${rect.right - rect.left}px`;
            styles.height = `${rect.bottom - rect.top}px`;
            styles.transform = `translateX(${rect.left + scrollLeft}px) translateY(${rect.top + scrollTop}px)`;
        }

        return styles;
    }
}
</script>
