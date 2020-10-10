<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page>

        <div style="padding-top: 42px">
            <div class="row q-pa-md q-gutter-md">
                <div class="col-4">
                    <h2 class="text-h6 q-pb-md" v-if="isNew">Add a new {{ taxonomy }}</h2>
                    <h2 class="text-h6 q-pb-md" v-if="!isNew">Edit a {{ taxonomy }}</h2>
                    <TermForm :taxonomy="taxonomy" :term.sync="term" @save="onSave" @delete="onDelete" @new="newTerm"/>
                </div>

                <div class="col">
                    <q-table
                        flat
                        binary-state-sort
                        :data="termsOfTaxonomy"
                        :columns="columns"
                        row-key="id"
                        :pagination.sync="pagination"
                        :loading="isLoadingOfTaxonomy"
                        @request="onRequest"
                        selection="multiple"
                        :selected.sync="selected"
                        :selected-rows-label="getSelectedString">
                        <template v-slot:body-cell-name="props">
                            <q-td :props="props">
                                <div class="cursor-pointer text-primary text-weight-medium" @click="editTerm(props.row)">{{ props.value }}</div>
                            </q-td>
                        </template>

                        <template v-slot:pagination="scope">
                            <div class="q-px-md">
                                {{ 1 + ((scope.pagination.page - 1) * scope.pagination.rowsPerPage) }}-{{ Math.min(scope.pagination.page * scope.pagination.rowsPerPage, termsCountOfTaxonomy) }} of {{ termsCountOfTaxonomy }}
                            </div>

                            <q-btn
                                v-if="scope.pagesNumber > 2"
                                icon="first_page"
                                color="grey-8"
                                round
                                dense
                                flat
                                :disable="scope.isFirstPage"
                                @click="scope.firstPage"
                            />

                            <q-btn
                                icon="chevron_left"
                                color="grey-8"
                                round
                                dense
                                flat
                                :disable="scope.isFirstPage"
                                @click="scope.prevPage"
                            />

                            <q-pagination
                                v-model="pagination.page"
                                @input="fetch"
                                color="grey-8"
                                :max="scope.pagesNumber"
                                size="sm"
                            />

                            <q-btn
                                icon="chevron_right"
                                color="grey-8"
                                round
                                dense
                                flat
                                :disable="scope.isLastPage"
                                @click="scope.nextPage"
                            />

                            <q-btn
                                v-if="scope.pagesNumber > 2"
                                icon="last_page"
                                color="grey-8"
                                round
                                dense
                                flat
                                :disable="scope.isLastPage"
                                @click="scope.lastPage"
                            />
                        </template>
                    </q-table>

                    <q-btn color="negative" label="Delete" @click="confirmDelete = true" v-if="selected.length > 0"/>
                </div>
            </div>
        </div>

        <q-dialog v-model="confirmDelete">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete_forever" color="negative" text-color="white" />
                    <span class="q-ml-sm" v-if="selected.length === 1">Do you want to permanently delete this {{ taxonomy }}?</span>
                    <span class="q-ml-sm" v-if="selected.length > 1">Do you want to permanently delete these {{ pluralTaxonomy }}?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="secondary" @click="confirmDelete = false" />
                    <q-btn flat :loading="deleteLoading" label="Yes" color="primary" @click="confirmDeleteAction" autofocus @keyup.enter="confirmDeleteAction"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    {{ formattedTaxonomy }}
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>

    </q-page>
</template>

<script lang="ts">
import TermForm from 'components/taxonomy/TermForm.vue';
import { get } from 'lodash';
import Taxonomy from 'src/model/interfaces/Taxonomy';
import Term from 'src/model/interfaces/Term';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as changeCase from 'change-case';
import { namespace } from 'vuex-class';
import pluralize from 'pluralize';
import { cloneDeep } from 'lodash';

const TaxonomyStore = namespace('Taxonomy');

@Component({
    components: {TermForm}
})
export default class TaxonomyIndex extends Vue {
    @TaxonomyStore.State private terms;
    @TaxonomyStore.State private termsCount;
    @TaxonomyStore.State private pagesCount;
    @TaxonomyStore.State private isLoading;
    @TaxonomyStore.Action private fetchTaxonomies;
    @TaxonomyStore.Action private fetchTermById;
    @TaxonomyStore.Action private fetchTermPage;
    @TaxonomyStore.Action private deleteTerms;

    @Prop()
    private taxonomy: string;

    @Prop()
    private id: string;

    private term: Term = this.getNewTerm();

    private pagination = {
        sortBy: 'name',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: this.termsCountOfTaxonomy,
    };

    private columns = [
        { name: 'name', required: true, label: 'Name', align: 'left', field: 'name', sortable: true },
        { name: 'slug', required: true, label: 'Slug', align: 'left', field: 'slug', sortable: true },
        { name: 'description', required: true, label: 'Description', align: 'left', field: 'description', sortable: false },
    ];

    private filter = '';
    private selected: Term[] = [];
    private confirmDelete = false;
    private deleteLoading = false;

    private async created() {
        await this.fetch();

        if (this.id) {
            let term = this.termsOfTaxonomy.find((t) => t.id === parseInt(this.id));

            if (!term) {
                term = await this.fetchTermById({taxonomy: this.taxonomy, id: this.id});
            }

            if (term) {
                this.term = cloneDeep(term);
            }
        }
    }

    @Watch('filter')
    private async fetch() {
        await this.onRequest({
            pagination: this.pagination,
            filter: this.filter,
        });
    }

    private async onRequest(props) {
        const { page, rowsPerPage, sortBy, descending } = props.pagination;
        const fetchCount = rowsPerPage === 0 ? '' : rowsPerPage;
        const startRow = (page - 1) * rowsPerPage;
        const filter = this.filter;

        await this.fetchTermPage({taxonomy: this.taxonomy, startRow, fetchCount, filter, sortBy, descending});

        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagination.rowsNumber = this.termsCountOfTaxonomy;
    }

    private getSelectedString() {
        return this.selected.length === 0 ? '' : `${this.selected.length} ${this.selected.length > 1 ? pluralize(this.taxonomy) : this.taxonomy} selected of ${this.termsOfTaxonomy.length}`
    }

    private getNewTerm(): Term {
        return new class implements Term {
            public description: string;
            public id: number;
            public name: string;
            public parent: Term;
            public slug: string;
            public taxonomy: Taxonomy;
        };
    }

    private reset(): void {
        this.term = this.getNewTerm();
    }

    private onSave(term: Term): void {
        this.term = cloneDeep(term);
        this.fetch();
    }

    private onDelete(): void {
        this.reset();
        this.fetch();
    }

    private async confirmDeleteAction() {
        this.deleteLoading = true;
        await this.deleteTerms({taxonomy: this.taxonomy, terms: this.selected});
        this.confirmDelete = false;
        this.deleteLoading = false;
        this.selected = [];
        await this.fetch();
    }

    private editTerm(term: Term) {
        if (parseInt(this.id) !== term.id) {
            this.$router.push({name: 'term_edit', params: {taxonomy: this.taxonomy, id: term.id!.toString()}});
        }
    }

    private newTerm() {
        if (this.id) {
            this.reset();
            this.$router.push({name: 'taxonomy_index', params: {taxonomy: this.taxonomy}});
        }
    }

    private get termsOfTaxonomy(): Term[] {
        return get(this.terms, this.taxonomy, []);
    }

    private get termsCountOfTaxonomy(): number {
        return get(this.termsCount, this.taxonomy, 0);
    }

    private get isLoadingOfTaxonomy(): boolean {
        return get(this.isLoading, this.taxonomy, false);
    }

    private get formattedTaxonomy(): string {
        return changeCase.capitalCase(this.pluralTaxonomy);
    }

    private get pluralTaxonomy(): string {
        return pluralize(this.taxonomy);
    }

    private get isNew(): boolean {
        return !this.term?.id;
    }
}
</script>
