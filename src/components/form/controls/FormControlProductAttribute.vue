<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-select v-model="model"
              :label="parameters.label"
              :options="productAttributes"
              option-label="name"
              option-value="id"
              map-options
              emit-value />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormControlParameters from '../../../model/interfaces/FormControlParameters';
import ProductAttribute from '../../../model/interfaces/ProductAttribute';
import { axios, Routing } from '../../../utils/routing';

@Component
export default class FormControlProductAttribute extends Vue {
    @Prop()
    private value: any;

    @Prop()
    private parameters: FormControlParameters;

    private productAttributes: ProductAttribute[] = [];

    private created() {
        axios.get(Routing.generate('numbernine_admin_commerce_product_attribute_get_collection'))
            .then((response) => {
                this.productAttributes = response.data;
            });
    }

    private get model() {
        const numericValue = parseInt(this.value);

        if (!isNaN(numericValue)) {
            return numericValue;
        }

        return null;
    }

    private set model(value) {
        if (value && value > 0) {
            this.$emit('input', value);
        }
    }
}
</script>
