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
                    {value: 'between', slot: 'between'},
                    {value: 'around', slot: 'around'},
                ]"
            >
                <template v-slot:start>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M4.5,4.5h3v7h-3V4.5z M9.5,4.5h3v7h-3V4.5z"/>
                            <path d="M2,0h1v16H2V0z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:center>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M2.5,4.5h3v7h-3V4.5z M9.5,4.5h3v7h-3V4.5z"/>
                            <path d="M7,0h1v16H7V0z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:end>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M12,0h1v16h-1V0z"/>
                            <path d="M2.5,4.5h3v7h-3V4.5z M7.5,4.5h3v7h-3V4.5z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:between>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M15,0h1v16h-1V0z M0,0h1v16H0V0z"/>
                            <path d="M10.5,4.5h3v7h-3V4.5z M2.5,4.5h3v7h-3V4.5z"/>
                        </svg>
                    </q-icon>
                </template>
                <template v-slot:around>
                    <q-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M15,0h1v16h-1V0z M0,0h1v16H0V0z"/>
                            <path d="M9.5,4.5h3v7h-3V4.5z M3.5,4.5h3v7h-3V4.5z"/>
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
export default class FormControlFlexJustify extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;
}
</script>
