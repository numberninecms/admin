<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-tool-context-menu" :style="styles()" v-if="isContextMenuVisible">
        <div class="n9-menu-buttons-list">
            <button @click="duplicateAction = true">Duplicate</button>
            <button @click="presetAction = true">Save as preset</button>
            <button @click="shortcodeAction = true">Show shortcode</button>
            <button @click="deleteAction = true">Delete</button>
        </div>
        <PageBuilderContextMenuActions :duplicate-action.sync="duplicateAction"
                                       :preset-action.sync="presetAction"
                                       :shortcode-action.sync="shortcodeAction"
                                       :delete-action.sync="deleteAction"/>
    </div>
</template>

<script lang="ts">
import PageBuilderContextMenuActions from 'components/pagebuilder/PageBuilderContextMenuActions.vue';
import { EventBus } from 'src/event/EventBus';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: {PageBuilderContextMenuActions}
})
export default class PageBuilderToolContextMenu extends Vue {
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private isContextMenuVisible;
    @PageBuilderStore.Action private hideContextMenu;

    private duplicateAction = false;
    private presetAction = false;
    private shortcodeAction = false;
    private deleteAction = false;

    private created() {
        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
        EventBus.on('Frame:resize', () => (this.$forceUpdate()));
    }

    @Watch('selectedId')
    private onSelectedIdChange() {
        this.hideContextMenu();
        this.$forceUpdate();
    }

    private get iFrameDocument(): Document {
        return (document.getElementById('page-builder-content-frame')!.querySelector('iframe') as HTMLIFrameElement).contentWindow!.document;
    }

    private styles() {
        const styles: any = {};

        const element = this.iFrameDocument.querySelector('#n9-page-builder-tool-select .n9-options');

        if (element) {
            const rect = element.getBoundingClientRect();
            const scrollLeft = this.iFrameDocument.documentElement.scrollLeft;
            const scrollTop = this.iFrameDocument.documentElement.scrollTop;

            styles.transform = `translateX(${rect.left + scrollLeft}px) translateY(${rect.top + scrollTop + 20}px)`;
        }

        return styles;
    }
}
</script>
