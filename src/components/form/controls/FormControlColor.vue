<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-input
        filled stack-label clearable
        :label="parameters.label"
        :value="value"
        @input="$emit('input', $event)">
        <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-color :value="value"
                             @input="$emit('input', $event)"
                             default-view="palette"
                             :palette="themeColors" />
                </q-popup-proxy>
            </q-icon>
        </template>
    </q-input>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

const SettingStore = namespace('Setting');

@Component
export default class FormControlColor extends Vue {
    @SettingStore.State private colors;
    @SettingStore.Action private queryColors;

    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private async created() {
        await this.queryColors();
    }

    private get themeColors() {
        return this.colors.map((c) => c.value);
    }

    private get backgroundColor() {
        return this.value ?? null;
    }
}
</script>
