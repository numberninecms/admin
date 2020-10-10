<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-card v-if="taxonomyTerms.length > 0">
        <q-card-section>
            <div class="text-h6">{{ taxonomyPlural }}</div>
            <q-separator/>
        </q-card-section>
        <q-card-section class="q-gutter-y-md">
            <q-select filled :options="taxonomyTerms" :label="`Select ${taxonomyPlural.toLowerCase()}`" option-label="name" option-value="id" multiple v-model="selectedTaxonomyTerms"/>

            <q-input :label="`Add new ${taxonomy}`" v-model="newTaxonomyTerm" filled @keyup.enter="saveTaxonomyTerm">
                <template v-slot:append>
                    <q-btn round dense flat icon="add" @click="saveTaxonomyTerm" :loading="saveLoading" />
                </template>
            </q-input>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import * as changeCase from 'change-case';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import SelectOption from 'src/model/interfaces/SelectOption';
import Term from 'src/model/interfaces/Term';
import TermPage from 'src/model/interfaces/TermPage';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import pluralize from 'pluralize';
import { upperFirst, get } from 'lodash';

const TaxonomyStore = namespace('Taxonomy');

@Component
export default class ClassicEditorSidebarTaxonomy extends Vue {
    @TaxonomyStore.State private terms;
    @TaxonomyStore.Action private saveTerm;
    @TaxonomyStore.Action private fetchTermPage: (page: TermPage) => Promise<void>;

    @Prop()
    private value: ContentEntity;

    @Prop()
    private taxonomy: string;

    private newTaxonomyTerm = '';
    private saveLoading = false;

    private created() {
        this.fetchTermPage({
            taxonomy: this.taxonomy,
            sortBy: 'name',
            descending: false,
        });
    }

    private async saveTaxonomyTerm() {
        this.saveLoading = true;
        const term = await this.saveTerm({taxonomy: this.taxonomy, term: {name: this.newTaxonomyTerm, slug: changeCase.paramCase(this.newTaxonomyTerm)}});

        if (!this.value.terms) {
            this.$set(this.value, 'terms', [term]);
        } else {
            this.value.terms.push(term);
        }

        this.newTaxonomyTerm = '';
        this.saveLoading = false;
    }

    private get taxonomyTerms(): SelectOption[] {
        return get(this.terms, this.taxonomy, []);
    }

    private get selectedTaxonomyTerms(): Term[] {
        return this.value.terms ? this.value.terms.filter((t) => t.taxonomy?.name === this.taxonomy) : [];
    }

    private set selectedTaxonomyTerms(value: Term[]) {
        value = value.map((c) => {
            c.taxonomy = {name: this.taxonomy};
            return c;
        });

        this.value.terms?.splice(0, this.value.terms?.length, ...this.value.terms?.filter((t) => !t.taxonomy || t.taxonomy.name !== this.taxonomy));
        this.value.terms?.push(...value);
    }

    private get taxonomyPlural(): string {
        return upperFirst(pluralize(this.taxonomy));
    }
}
</script>
