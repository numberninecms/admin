<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="active"
         @mousemove="onMouseMove"
         @mouseup="onMouseUp"
         class="invisible-overlay">
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { EventBus } from '../../../event/EventBus';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class SlidableInputOverlay extends Vue {
    @PageBuilderStore.Action private setSlideDragging;
    @PageBuilderStore.Action private setSlideDraggingOriginPosition;
    @PageBuilderStore.Action private setSlideDraggingOriginValue;
    @PageBuilderStore.State private isSlideDragging;

    private onMouseMove(event) {
        if (this.isSlideDragging) {
            EventBus.emit('SlideDragging:position', {x: event.clientX, y: event.clientY});
        }
    }

    private onMouseUp() {
        this.setSlideDragging(false);
        this.setSlideDraggingOriginPosition(undefined);
        this.setSlideDraggingOriginValue(0);
        EventBus.emit('SlideDragging:stop');
    }

    private get active() {
        return this.isSlideDragging;
    }
}
</script>

<style lang="scss" scoped>
.invisible-overlay {
    pointer-events: all;
    cursor: ew-resize;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 5000;
    margin-left: -100vw;
}
</style>
