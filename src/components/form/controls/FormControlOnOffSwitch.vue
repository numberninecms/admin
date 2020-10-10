<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="!parameters.displayValue">
        <q-toggle v-model="model" :label="parameters.label" @input="onChange" />
    </div>
    <div v-else class="row q-col-gutter-md relative-position q-mt-lg items-center">
        <div class="absolute ellipsis control-label">
            {{ parameters.label }}
        </div>
        <q-toggle v-model="model" :label="model" @input="onChange" :true-value="parameters.trueValue" :false-value="parameters.falseValue" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlOnOffSwitch extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private model = false;

    private created() {
        this.model = this.value;
    }

    private onChange() {
        this.$emit('input', this.model);
    }
}
</script>
