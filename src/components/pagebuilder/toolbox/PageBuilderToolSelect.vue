<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-select" :style="styles()" v-if="!!selectedId">
        <div class="n9-wrapper" v-show="!dragId">
            <div v-if="ancestors().length > 0" class="n9-ancestors" @mouseover="showAncestors = true" @mouseleave="showAncestors = false">
                <i class="n9-fas n9-fa-chevron-down n9-text-white"></i>
                <ul v-if="showAncestors" @mouseleave="showAncestors = false">
                    <li v-for="ancestor in ancestors()" :key="'ancestor-' + ancestor.id">
                        <button type="button" @click.stop="select(ancestor.id)" @mouseover.stop="setHighlightedId(ancestor.id)">
                            {{ capitalize(ancestor.name) }}
                        </button>
                    </li>
                </ul>
            </div>
            <h3 @mousedown="setDragId(selectedId)">
                {{ label }}
            </h3>
            <button class="n9-options n9-text-white" @click="toggleContextMenu">
                <i class="n9-fas n9-fa-cog"></i>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'quasar';
import { EventBus } from 'src/event/EventBus';
const { capitalize } = format;
import PageComponent from 'src/model/interfaces/PageComponent';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderToolSelect extends Vue {
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private dragId;
    @PageBuilderStore.Action private toggleContextMenu;
    @PageBuilderStore.Action private setSelectedId;
    @PageBuilderStore.Action private setHighlightedId;
    @PageBuilderStore.Action private setDragId;
    @PageBuilderStore.Getter private getComponentById;
    @PageBuilderStore.Getter private getComponentAncestors;

    private showAncestors = false;

    private created() {
        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
        EventBus.on('Frame:resize', () => (this.$forceUpdate()));
    }

    private capitalize(text: string): string {
        return capitalize(text);
    }

    private select(id: string): void {
        this.setSelectedId(id);
        this.showAncestors = false;
        EventBus.emit('PageBuilder:edit-component');
    }

    private get label(): string {
        return this.component ? capitalize(this.component.label) : '';
    }

    private get component(): PageComponent | undefined {
        return this.getComponentById(this.selectedId);
    }

    private get iFrameDocument(): Document {
        return (document.getElementById('page-builder-content-frame')!.querySelector('iframe') as HTMLIFrameElement).contentWindow!.document;
    }

    private styles() {
        const styles: any = {};

        const element = this.iFrameDocument.querySelector(`[data-component-id='${this.selectedId}']`);

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

    private ancestors(): [] {
        return this.getComponentAncestors(this.component);
    }
}
</script>
