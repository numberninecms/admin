<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div>
        <q-input :value="value"
                 @input="$emit('input', $event)"
                 :suffix="suffix"
                 dense
                 filled
                 borderless
                 hide-bottom-space
                 :style="styles"
                 class="slidable-input"
                 @dblclick.native="stopDragging"
                 @click.native="stopDragging"
                 @mousedown.native="mouseDown"
                 @mousemove.native="mouseMove"
        />
        <SlidableInputOverlay v-if="isSelfDragging"/>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { EventBus } from 'src/event/EventBus';
import Point2D from 'src/model/interfaces/Point2D';
import SlidableInputOverlay from './SlidableInputOverlay.vue';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: { SlidableInputOverlay }
})
export default class SlidableInput extends Vue {
    @PageBuilderStore.Action private setSlideDragging;
    @PageBuilderStore.Action private setSlideDraggingOriginPosition;
    @PageBuilderStore.Action private setSlideDraggingOriginValue;
    @PageBuilderStore.State private isSlideDragging;
    @PageBuilderStore.State private slideDraggingOriginPosition;
    @PageBuilderStore.State private slideDraggingOriginValue: number;

    @Prop()
    private value: any;

    @Prop()
    private border: 'top' | 'bottom' | 'left' | 'right' | undefined;

    @Prop()
    private suffix: string;

    @Prop()
    private min: number | undefined;

    @Prop()
    private max: number | undefined;

    private mouse: {down: boolean, move: boolean} = {down: false, move: false};

    private mouseDown(event) {
        this.mouse.down = true;
        this.setSlideDraggingOriginPosition({x: event.clientX, y: event.clientY});
    }

    private mouseMove() {
        if (this.mouse.down) {
            if (!this.mouse.move) {
                this.mouse.move = true;
                this.setSlideDragging(true);
                this.setSlideDraggingOriginValue(this.value);
                document.querySelector('body')!.style.pointerEvents = 'all';
                EventBus.on('SlideDragging:position', this.updatePosition);
                EventBus.on('SlideDragging:stop', this.stopDragging);
            }
        } else {
            this.mouse.move = false;
        }
    }

    private updatePosition(position?: Point2D): void {
        if (!position) {
            return;
        }

        let newValue = this.slideDraggingOriginValue + position.x - this.slideDraggingOriginPosition.x;

        if (this.min !== undefined) {
            newValue = Math.max(newValue, this.min);
        }

        if (this.max !== undefined) {
            newValue = Math.min(newValue, this.max);
        }

        this.$emit('input', newValue);
    }

    private stopDragging(): void {
        EventBus.all.delete('SlideDragging:position');
        EventBus.all.delete('SlideDragging:stop');
        this.mouse.move = false;
        this.mouse.down = false;
    }

    private get isSelfDragging(): boolean {
        return this.mouse.down && this.mouse.move;
    }

    private get styles(): string {
        if (!this.border) {
            return '';
        }

        return `border-${this.border}: 1px solid`;
    }
}
</script>
<style lang="scss">
.slidable-input {
    &.q-field--filled {
        .q-field__control {
            height: 30px;

            &:after {
                height: 0;
                display: none;
            }
            &:before {
                border-bottom: none;
            }
        }

        cursor: ew-resize;

        * {
            cursor: ew-resize;
        }
    }

    .q-field__suffix {
        line-height: 0px;
    }
}
</style>
