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
        <q-input v-if="parameters.editable" :label="parameters.label" :value="value" @input="$emit('input', $event)" dense borderless />
        <q-field :label="parameters.editable ? '' : parameters.label" borderless stack-label>
            <q-slider
                :value="valueInt"
                :min="parameters.min"
                :max="parameters.max"
                :step="parameters.step"
                label
                label-always
                :label-value="value + parameters.suffix"
                @input="$emit('input', $event)"
            />
        </q-field>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlSlider extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private get valueInt(): number {
        return parseInt(this.value);
    }
}
</script>
