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
        <q-toolbar class="bg-grey-3 text-primary q-pl-none q-pr-xs" style="padding-top: 42px">
            <q-tabs
                v-model="tab"
                no-caps
                dense
                shrink
                stretch
                align="left"
            >
                <q-tab name="all" label="All" />
                <q-tab name="published" label="Published" />
                <q-tab name="trash" label="Trash" />
            </q-tabs>
            <q-space />
            <q-input dense v-model="filter" label="Filter" class="q-mb-xs">
                <template v-slot:append>
                    <q-icon v-if="filter === ''" name="search" />
                    <q-icon v-else name="clear" class="cursor-pointer" @click="filter = ''" />
                </template>
            </q-input>
        </q-toolbar>

        <q-table
            flat
            binary-state-sort
            :data="contentEntitiesOfType"
            :columns="columns"
            row-key="id"
            :pagination.sync="pagination"
            :loading="isLoadingOfType"
            @request="onRequest"
            selection="multiple"
            :selected.sync="selected"
            :selected-rows-label="getSelectedString">
            <template v-slot:body-cell="props">
                <q-td>
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-title="props">
                <q-td :props="props" @mouseover.native="showDetails = props.row.id" @mouseleave.native="showDetails = null">
                    <router-link v-if="type" :to="{name: type + '_edit', params: {id: props.row.id}}" class="text-weight-medium" style="">{{ props.value }}</router-link>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td>
                    <q-btn-group flat>
                        <q-btn flat dense color="primary" icon="mdi-file-document-edit-outline" v-if="type && tab !== 'trash'" :to="{name: type + '_edit_classic', params: {id: props.row.id}}">
                            <q-tooltip>Classic editor</q-tooltip>
                        </q-btn>
                        <q-btn flat dense color="primary" icon="mdi-backup-restore" v-if="tab === 'trash'" @click="restore([props.row])">
                            <q-tooltip>Restore</q-tooltip>
                        </q-btn>
                        <q-btn flat dense color="negative" icon="mdi-delete-outline" @click="singleDelete(props.row)">
                            <q-tooltip>Delete{{ tab === 'trash' ? ' permanently' : '' }}</q-tooltip>
                        </q-btn>
                        <q-btn flat dense color="secondary" icon="mdi-eye-outline" v-if="tab !== 'trash'" :href="props.row.publicUrl" type="a" target="_blank">
                            <q-tooltip>View</q-tooltip>
                        </q-btn>
                    </q-btn-group>
                </q-td>
            </template>
            <template v-slot:body-cell-username="props">
                <q-td>
                    <router-link v-if="props.row.author" :to="{name: 'user_edit', params: {id: props.row.author.id}}" style="">{{ props.value }}</router-link>
                    <span v-else>—</span>
                </q-td>
            </template>
            <template v-slot:body-cell-categories="props">
                <q-td>
                    <router-link v-for="term in props.value" :key="term.id" :to="{name: 'term_edit', params: {id: term.id, taxonomy: 'category'}}">{{ term.name }}</router-link>
                </q-td>
            </template>
            <template v-slot:body-cell-tags="props">
                <q-td class="q-gutter-x-xs">
                    <router-link v-for="term in props.value" :key="term.id" :to="{name: 'term_edit', params: {id: term.id, taxonomy: 'tag'}}">{{ term.name }}</router-link>
                </q-td>
            </template>

            <template v-slot:pagination="scope">
                <div class="q-px-md">
                    {{ 1 + ((scope.pagination.page - 1) * scope.pagination.rowsPerPage) }}-{{ Math.min(scope.pagination.page * scope.pagination.rowsPerPage, contentEntitiesCountOfType) }} of {{ contentEntitiesCountOfType }}
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

        <div class="q-pa-md q-gutter-md">
            <q-btn color="negative" label="Empty trash" @click="emptyTrash" v-if="tab === 'trash'"/>
            <q-btn color="negative" label="Delete" @click="confirmDelete = true" v-if="selected.length > 0"/>
            <q-btn color="primary" :loading="restoreLoading" label="Restore" @click="restore(selected)" v-if="selected.length > 0 && tab === 'trash'"/>
        </div>

        <q-dialog v-model="confirmDelete">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar :icon="tab === 'trash' ? 'delete_forever' : 'delete'" color="negative" text-color="white" />
                    <span class="q-ml-sm" v-if="selected.length === 1">Do you want to{{ tab === 'trash' ? ' permanently' : '' }} delete this {{ contentType.labels.singularName }}?</span>
                    <span class="q-ml-sm" v-if="selected.length > 1">Do you want to{{ tab === 'trash' ? ' permanently' : '' }} delete these {{ contentType.labels.pluralName }}?</span>
                    <span class="q-ml-sm" v-if="selected.length === 0">Do you want to permanently delete all {{ contentType.labels.pluralName }}?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="secondary" @click="confirmDelete = false" />
                    <q-btn flat :loading="deleteLoading" label="Yes" color="primary" @click="confirmDeleteAction" autofocus @keyup.enter="confirmDeleteAction"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title v-if="contentType">
                    {{ contentType.labels.menuName }}
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>

    </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { EventBus } from 'src/event/EventBus';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import ContentType from 'src/model/interfaces/ContentType';
import dateFormat from 'dateformat';
import { namespace } from 'vuex-class';
import { get } from 'lodash';
import Term from 'src/model/interfaces/Term';

const ContentTypeStore = namespace('ContentType');
const ContentStore = namespace('Content');

@Component
export default class ContentIndex extends Vue {
    @ContentTypeStore.State private contentTypes;
    @ContentStore.State private contentEntities;
    @ContentStore.State private contentEntitiesCount;
    @ContentStore.State private isLoading;
    @ContentStore.Action private fetchPage;
    @ContentStore.Action private deleteEntities;
    @ContentStore.Action private restoreEntities;

    @Prop()
    private type: string;

    private tab = 'all';
    private filter = '';
    private showDetails: number|null = null;

    private pagination = {
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: this.contentEntitiesCountOfType,
    };

    private columns = [
        { name: 'title', required: true, label: 'Title', align: 'left', field: 'title', sortable: true },
        { name: 'actions', required: true, label: '', align: 'left', field: null },
        { name: 'username', required: true, label: 'Author', align: 'left', field: row => row.author?.username ?? '—', sortable: true },
        { name: 'categories', label: 'Categories', align: 'left', field: row => this.getTaxonomyTerms(row, 'category') },
        { name: 'tags', label: 'Tags', align: 'left', field: row => this.getTaxonomyTerms(row, 'tag') },
        { name: 'comments', label: 'Comments', align: 'left', field: 'comments' },
        { name: 'createdAt', label: 'Date', align: 'left', field: 'createdAt', format: val => dateFormat(val, 'yyyy/mm/dd'), sortable: true },
    ];

    private selected: ContentEntity[] = [];
    private confirmDelete = false;
    private deleteLoading = false;
    private restoreLoading = false;

    private created() {
        EventBus.on('ContentType:loaded', () => this.fetch());

        if(this.contentType) {
            this.fetch();
        }
    }

    @Watch('filter')
    private fetch() {
        if (this.contentType) {
            this.onRequest({
                pagination: this.pagination,
                filter: this.filter,
            });
        }
    }

    @Watch('tab')
    private onTabChanged() {
        this.selected = [];
        this.fetch();
    }

    private async onRequest(props) {
        const { page, rowsPerPage, sortBy, descending } = props.pagination;
        const fetchCount = rowsPerPage === 0 ? '' : rowsPerPage;
        const startRow = (page - 1) * rowsPerPage;
        const filter = this.filter;

        await this.fetchPage({type: this.contentType, startRow, fetchCount, filter, sortBy, descending, status: this.contentStatus});

        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagination.rowsNumber = this.contentEntitiesCountOfType;
    }

    private get contentType(): ContentType {
        return this.contentTypes.find((c) => c.name === this.type);
    }

    private get contentEntitiesOfType(): ContentEntity[] {
        return get(this.contentEntities, this.type, []);
    }

    private get contentEntitiesCountOfType(): number {
        return get(this.contentEntitiesCount, this.type, 0);
    }

    private get isLoadingOfType(): boolean {
        return get(this.isLoading, this.type, false);
    }

    private get contentStatus(): string {
        switch (this.tab) {
            case 'published':
                return 'publish';
            case 'trash':
                return 'deleted';
            default:
                return 'publish,private,draft';
        }
    }

    private getSelectedString() {
        return this.selected.length === 0 ? '' : `${this.selected.length} ${this.selected.length > 1 ? this.contentType.labels.pluralName : this.contentType.labels.singularName} selected of ${this.contentEntitiesOfType.length}`
    }

    private async confirmDeleteAction() {
        this.deleteLoading = true;
        await this.deleteEntities({type: this.contentType, entities: this.selected});
        this.confirmDelete = false;
        this.deleteLoading = false;
        this.selected = [];
        this.fetch();
    }

    private async singleDelete(entity) {
        await this.deleteEntities({type: this.contentType, entities: [entity]});

        if (this.selected.find((e) => e.id === entity.id)) {
            this.selected.splice(this.selected.findIndex((e) => e.id === entity.id), 1);
        }

        this.fetch();
    }

    private emptyTrash() {
        this.selected = [];
        this.confirmDelete = true;
    }

    private async restore(entities) {
        this.restoreLoading = true;
        await this.restoreEntities({type: this.contentType, entities: entities});
        this.restoreLoading = false;

        entities.forEach((entity) => {
            if (this.selected.find((e) => e.id === entity.id)) {
                this.selected.splice(this.selected.findIndex((e) => e.id === entity.id), 1);
            }
        });

        this.fetch();
    }

    private getTaxonomyTerms(entity: any, taxonomy: string): Term[] {
        return entity.terms.filter((t) => t.taxonomy.name === taxonomy);
    }
}
</script>
