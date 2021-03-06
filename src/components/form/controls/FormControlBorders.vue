<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="row q-col-gutter-md relative-position q-mt-lg">
        <div class="absolute ellipsis control-label">
            {{ parameters.label }}
        </div>
        <div class="col-3" v-if="hasBorder('top')">
            <SlidableInput v-model="model.top" @input="onChange" border="top"/>
        </div>
        <div class="col-3" v-if="hasBorder('right')">
            <SlidableInput v-model="model.right" @input="onChange" class="col-3" border="right"/>
        </div>
        <div class="col-3" v-if="hasBorder('bottom')">
            <SlidableInput v-model="model.bottom" @input="onChange" class="col-3" border="bottom"/>
        </div>
        <div class="col-3" v-if="hasBorder('left')">
            <SlidableInput v-model="model.left" @input="onChange" class="col-3" border="left"/>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Borders from 'src/model/interfaces/Borders';
import FormControlParameters from 'src/model/interfaces/FormControlParameters';
import SlidableInput from 'src/components/form/components/SlidableInput.vue';

@Component({
    components: {SlidableInput}
})
export default class FormControlBorders extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private model: Borders | null = null;

    private created() {
        this.model = this.values;
    }

    @Watch('value')
    private onValueChanged() {
        this.model = this.values;
    }

    private get values(): Borders {
        const array = this.value ? this.value.split(' ')
            .map((value) => {
                const v = value.replace('px', '');
                return v !== 'auto' ? parseInt(v) : v;
            }) : [];

        return {
            top: array.length > 0 ? array[0] : 0,
            right: array.length > 1 ? array[1] : (array.length > 0 ? array[0] : 0),
            bottom: array.length > 2 ? array[2] : (array.length > 0 ? array[0] : 0),
            left: array.length > 3 ? array[3] : (array.length > 1 ? array[1] : (array.length > 0 ? array[0] : 0)),
        }
    }

    private get formattedModel(): string {
        if (!this.model) {
            return '';
        }

        const values = {
            top: this.hasBorder('top') ? `${this.model.top}px` : 'auto',
            right: this.hasBorder('right') ? `${this.model.right}px` : 'auto',
            bottom: this.hasBorder('bottom') ? `${this.model.bottom}px` : 'auto',
            left: this.hasBorder('left') ? `${this.model.left}px` : 'auto',
        }

        return `${values.top} ${values.right} ${values.bottom} ${values.left}`
            .replace(/\b0px/g, '0')
            .replace(/^0 0$/, '0')
            .replace(/^0 0 0 0$/, '0')
    }

    private onChange() {
        this.$emit('input', this.formattedModel);
    }

    private hasBorder(border: 'top' | 'bottom' | 'left' | 'right'): boolean {
        return this.parameters.borders.indexOf(border) !== -1;
    }
}
</script>
