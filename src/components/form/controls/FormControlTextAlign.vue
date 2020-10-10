<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-field :label="parameters.label" stack-label borderless class="full-width">
        <template v-slot:control>
            <q-btn-toggle
                spread
                class="full-width q-pt-xs"
                :value="value"
                @input="$emit('input', $event)"
                :options="[
                    {value: 'left', slot: 'left'},
                    {value: 'center', slot: 'center'},
                    {value: 'right', slot: 'right'}
                ]"
            >
                <template v-slot:left>
                    <q-icon name="format_align_left" />
                </template>
                <template v-slot:center>
                    <q-icon name="format_align_center" />
                </template>
                <template v-slot:right>
                    <q-icon name="format_align_right" />
                </template>
            </q-btn-toggle>
        </template>
    </q-field>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlTextAlign extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;
}
</script>
