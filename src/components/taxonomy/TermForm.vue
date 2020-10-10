<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <form class="q-gutter-md" @submit.prevent.stop="onSubmit">
        <q-input v-model="term.name"
                 ref="name"
                 @input="slugify"
                 filled
                 :rules="[val => !!val || '* Required']"
                 lazy-rules="ondemand"
                 label="Name"/>

        <q-input v-model="term.slug"
                 ref="slug"
                 filled
                 :rules="[val => !!val || '* Required']"
                 lazy-rules="ondemand"
                 label="Slug"/>

        <q-input v-model="term.description"
                 filled
                 autogrow
                 label="Description"/>

        <q-btn label="Save" type="submit" :loading="isLoading" color="primary"/>
        <q-btn label="Delete" :loading="isDeleting" color="negative" @click="deleteTaxonomyTerm" v-if="term.id"/>
        <q-btn label="New" @click="$emit('new')"/>
    </form>
</template>
<script lang="ts">
import Term from 'src/model/interfaces/Term';
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import * as changeCase from 'change-case';

const TaxonomyStore = namespace('Taxonomy');

@Component
export default class TermForm extends Vue {
    @TaxonomyStore.Action private saveTerm;
    @TaxonomyStore.Action private deleteTerms;

    @Ref('name')
    private name;

    @Ref('slug')
    private slug;

    @Prop()
    private term: Term;

    @Prop()
    private taxonomy: string;

    private isLoading = false;
    private isDeleting = false;

    private async saveTaxonomyTerm(): Promise<void> {
        this.isLoading = true;
        const term = await this.saveTerm({taxonomy: this.taxonomy, term: this.term});
        this.isLoading = false;
        this.$emit('save', term);
    }

    private async deleteTaxonomyTerm(): Promise<void> {
        this.isDeleting = true;
        await this.deleteTerms({taxonomy: this.taxonomy, terms: [this.term]});
        this.isDeleting = false;
        this.$emit('delete');
    }

    private slugify(): void {
        this.term.slug = changeCase.paramCase(this.term.name);
    }

    private onSubmit(): void {
        this.name.validate();
        this.slug.validate();

        if (!this.name.hasError && !this.slug.hasError) {
            this.saveTaxonomyTerm();
        }
    }
}
</script>
