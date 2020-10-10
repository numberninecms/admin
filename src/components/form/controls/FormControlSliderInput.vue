<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="row q-col-gutter-md relative-position q-mt-lg items-center">
        <div class="absolute ellipsis control-label">
            {{ parameters.label }}
        </div>
        <div :class="'col-' + (parameters.suffix ? 7 : 8)">
            <q-slider
                v-model="model"
                :min="parameters.min"
                :max="parameters.max"
                :step="parameters.step"
                :label-value="model + parameters.suffix"
                @input="$emit('input', model)"
            />
        </div>
        <div :class="'col-' + (parameters.suffix ? 5 : 4)">
            <SlidableInput v-model="model"
                           @input="$emit('input', model)"
                           class="col-grow"
                           :min="parameters.min"
                           :max="parameters.max"
                           :suffix="parameters.suffix"/>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';
import SlidableInput from '../components/SlidableInput.vue';

@Component({
    components: { SlidableInput }
})
export default class FormControlSliderInput extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private model = 0;

    private created() {
        this.model = this.value ? parseInt(this.value) : this.parameters.min;
    }
}
</script>
