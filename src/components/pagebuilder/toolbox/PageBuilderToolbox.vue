<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="n9-page-builder-toolbox">
        <PageBuilderToolOutline :mouse-in="mouseIn"/>
        <PageBuilderToolSelect/>
        <PageBuilderToolDragHandle :mouse-coordinates="mouseCoordinates" :mouse-in="mouseIn"/>
        <PageBuilderToolInsertLine :mouse-coordinates="mouseCoordinates" :mouse-in="mouseIn"/>
        <PageBuilderToolInsertButton :mouse-coordinates="mouseCoordinates" :mouse-in="mouseIn"/>
        <PageBuilderToolContextMenu/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PageBuilderToolContextMenu from './PageBuilderToolContextMenu.vue';
import PageBuilderToolDragHandle from './PageBuilderToolDragHandle.vue';
import PageBuilderToolInsertLine from './PageBuilderToolInsertLine.vue';
import PageBuilderToolInsertButton from './PageBuilderToolInsertButton.vue';
import PageBuilderToolOutline from './PageBuilderToolOutline.vue';
import PageBuilderToolSelect from './PageBuilderToolSelect.vue';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: {
        PageBuilderToolInsertLine,
        PageBuilderToolInsertButton,
        PageBuilderToolDragHandle,
        PageBuilderToolSelect,
        PageBuilderToolOutline,
        PageBuilderToolContextMenu,
    }
})
export default class PageBuilderToolbox extends Vue {
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private highlightedId;

    @Prop()
    private mouseCoordinates: any;

    @Prop({type: Boolean, default: false})
    private mouseIn: boolean;
}
</script>
