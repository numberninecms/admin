<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-input filled stack-label
             :value="value"
             :label="parameters.label"
             @input="$emit('input', $event)" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlTextBox extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;
}
</script>
