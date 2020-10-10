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
        <div class="col-3" v-if="parameters.borders.indexOf('top') !== -1">
            <SlidableInput v-model="model.top" @input="onChange" border="top"/>
        </div>
        <div class="col-3" v-if="parameters.borders.indexOf('right') !== -1">
            <SlidableInput v-model="model.right" @input="onChange" class="col-3" border="right"/>
        </div>
        <div class="col-3" v-if="parameters.borders.indexOf('bottom') !== -1">
            <SlidableInput v-model="model.bottom" @input="onChange" class="col-3" border="bottom"/>
        </div>
        <div class="col-3" v-if="parameters.borders.indexOf('left') !== -1">
            <SlidableInput v-model="model.left" @input="onChange" class="col-3" border="left"/>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Borders from '../../../model/interfaces/Borders';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';
import SlidableInput from '../components/SlidableInput.vue';

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

        return new class implements Borders {
            top: number = array.length > 0 ? array[0] : 0;
            right: number = array.length > 1 ? array[1] : (array.length > 0 ? array[0] : 0);
            bottom: number = array.length > 2 ? array[2] : (array.length > 0 ? array[0] : 0);
            left: number = array.length > 3 ? array[3] : (array.length > 1 ? array[1] : (array.length > 0 ? array[0] : 0));
        }
    }

    private get formattedModel(): string {
        if (!this.model) {
            return '';
        }

        const values = {
            top: this.parameters.borders.indexOf('top') !== -1 ? `${this.model.top}px` : 'auto',
            right: this.parameters.borders.indexOf('right') !== -1 ? `${this.model.right}px` : 'auto',
            bottom: this.parameters.borders.indexOf('bottom') !== -1 ? `${this.model.bottom}px` : 'auto',
            left: this.parameters.borders.indexOf('left') !== -1 ? `${this.model.left}px` : 'auto',
        }

        return `${values.top} ${values.right} ${values.bottom} ${values.left}`
            .replace(/\b0px/g, '0')
            .replace(/^0 0$/, '0')
            .replace(/^0 0 0 0$/, '0')
    }

    private onChange() {
        this.$emit('input', this.formattedModel);
    }
}
</script>
