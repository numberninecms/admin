<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-dialog :value="value" @input="$emit('input', false)">
        <q-card style="max-width: 80vw;">
            <q-card-section class="flex wrap q-gutter-md">
                <q-list bordered separator v-for="(component, name) in availablePageComponents" :key="name">
                    <q-item clickable v-ripple @click="$emit('component-click', name)">
                        <q-item-section>{{ component.label }}</q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Close" color="secondary" @click="$emit('close')"/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderAvailableComponentsDialog extends Vue {
    @PageBuilderStore.State private availablePageComponents;

    @Prop({type: Boolean})
    private value: boolean;
}
</script>
