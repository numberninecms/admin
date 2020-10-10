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
        <q-btn-toggle class="full-width"
                      :value="value"
                      :label="parameters.label"
                      :options="parameters.choices"
                      spread
                      no-caps
                      unelevated
                      @input="$emit('input', $event)" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlButtonToggle extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;
}
</script>
