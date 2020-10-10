<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <p class="text-faded">Sorry, nothing here...<strong>(404)</strong></p>
    <q-btn color="secondary" style="width:200px;" @click="goBack" label="Go back" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Error404 extends Vue {
    name = 'Error404';

    private goBack() {
        this.$router.go(-1);
    }
}
</script>
