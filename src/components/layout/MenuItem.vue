<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-item v-ripple clickable :to="menuItem.link" exact :class="{'bg-secondary': child, 'bg-dark': !child}" exact-active-class="text-white">
        <q-item-section avatar>
            <q-icon :name="menuItem.icon" />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ menuItem.text }}</q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AdminMenuItem from 'src/model/interfaces/AdminMenuItem';

@Component
export default class extends Vue {
    @Prop()
    private menuItem: AdminMenuItem;

    @Prop({type: Boolean, default: false})
    private child: boolean;
}
</script>
