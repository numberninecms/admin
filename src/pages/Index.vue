<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
  <q-page class="flex flex-center">
    <img alt="Quasar logo" src="~assets/app-logo-360p.png" />
  </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Index extends Vue {
    name: 'PageIndex'
}
</script>
