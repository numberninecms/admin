<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="page-builder" @mousemove="updateMouseCoordinates" @mouseenter="mouseIn = true" @mouseleave="mouseIn = false">
        <PageBuilderComponent v-for="component in components" :key="component.id" :component="component" />
        <PageBuilderToolbox :mouse-coordinates="mouseCoordinates" :mouse-in="mouseIn"/>
    </div>
</template>
<script lang="ts">
import Point2D from 'src/model/interfaces/Point2D';
import { Component, Vue } from 'vue-property-decorator';
import { EventBus } from 'src/event/EventBus';
import PageBuilderComponent from './PageBuilderComponent.vue';
import PageBuilderToolbox from './toolbox/PageBuilderToolbox.vue';
import PageComponent from 'src/model/interfaces/PageComponent';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: { PageBuilderToolbox,  PageBuilderComponent }
})
export default class PageBuilder extends Vue {
    @PageBuilderStore.State private pageComponents;
    @PageBuilderStore.Action private setPageComponents;

    private mouseCoordinates: Point2D = {x: 0, y: 0};
    private mouseIn = false;

    private created() {
        EventBus.on('PageBuilder:update-parameter-after', () => (this.$forceUpdate()));
        EventBus.on('PageBuilder:move-component-after', () => (this.$forceUpdate()));
    }

    private updateMouseCoordinates(event) {
        this.mouseCoordinates = {x: event.clientX, y: event.clientY};
    }

    private get components(): PageComponent[] {
        return this.pageComponents;
    }

    private set components(value) {
        this.setPageComponents(value);
    }
}
</script>
