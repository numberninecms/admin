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
                    {value: 'start', slot: 'start'},
                    {value: 'center', slot: 'center'},
                    {value: 'end', slot: 'end'},
                    {value: 'stretch', slot: 'stretch'},
                    {value: 'baseline', slot: 'baseline'},
                ]"
            >
                <template v-slot:start>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M0,3h16v1H0V3z"/>
                            <path d="M3.5,5.5h3v7h-3V5.5z M8.5,5.5h3v5h-3V5.5z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:center>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M3.5,3.5h3v8h-3V3.5z M8.5,4.5h3v6h-3V4.5z"/>
                            <path d="M0,7h16v1H0V7z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:end>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M0,12h16v1H0V12z"/>
                            <path d="M3.5,3.5h3v7h-3V3.5z M8.5,5.5h3v5h-3V5.5z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:stretch>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M0,0h16v1H0V0z M0,15h16v1H0V15z"/>
                            <path d="M3.5,2.5h3v11h-3V2.5z M8.5,2.5h3v11h-3V2.5z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:baseline>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M0,7h16v1H0V7z"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12,3H8v7h4V3z M11,4H9v3h2V4z M7,3H3v9h4V3z M6,4H4v3h2V4z"/>
                        </svg>
                    </q-icon>
                </template>
            </q-btn-toggle>
        </template>
    </q-field>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';

@Component
export default class FormControlFlexAlign extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;
}
</script>
