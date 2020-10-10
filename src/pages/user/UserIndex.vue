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
            :data="users"
            :columns="columns"
            row-key="id"
            :pagination.sync="pagination"
            :loading="isUserLoading"
            @request="onRequest"
            selection="multiple"
            :selected.sync="selected"
            :selected-rows-label="getSelectedString">
            <template v-slot:body-cell="props">
                <q-td class="vertical-top" style="padding-bottom: 0">
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-username="props">
                <q-td :props="props" @mouseover.native="showDetails = props.row.id" @mouseleave.native="showDetails = null" class="vertical-top" style="padding-bottom: 0">
                    <div class="col">
                        <router-link :to="{name: 'user_edit', params: {id: props.row.id}}" class="text-weight-medium">{{ props.value }}</router-link>
                    </div>
                    <div class="row q-gutter-x-sm" :class="{invisible: showDetails !== props.row.id}">
                        <router-link :to="{name: 'user_edit', params: {id: props.row.id}}">Edit</router-link>
                        <div class="cursor-pointer text-negative" @click="singleDelete(props.row)">Delete</div>
                        <a :href="props.row.publicUrl" target="_blank">View</a>
                    </div>
                </q-td>
            </template>

            <template v-slot:pagination="scope">
                <div class="q-px-md">
                    {{ 1 + ((scope.pagination.page - 1) * scope.pagination.rowsPerPage) }}-{{ Math.min(scope.pagination.page * scope.pagination.rowsPerPage, usersCount) }} of {{ usersCount }}
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
            <q-btn color="negative" label="Delete" @click="confirmDelete = true" v-if="selected.length > 0"/>
        </div>

        <DeleteUserConfirm v-model="confirmDelete" :selected="selected" @done="onDeleteDone" @close="confirmDelete = false"/>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    Users
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import DeleteUserConfirm from 'components/user/DeleteUserConfirm.vue';
import User from 'src/model/interfaces/User';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserStore = namespace('User');

@Component({
    components: {DeleteUserConfirm}
})
export default class UserIndex extends Vue {
    @UserStore.State private users: User[];
    @UserStore.State private usersCount!: number;
    @UserStore.State private pagesCount: number;
    @UserStore.State private isUserLoading;
    @UserStore.Action private fetchPage;

    private filter = '';
    private selected: User[] = [];
    private showDetails: number|null = null;
    private confirmDelete = false;
    private pagination = {
        sortBy: 'username',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: this.usersCount,
    };

    private columns = [
        { name: 'username', label: 'Username', align: 'left', field: 'username', sortable: true },
        { name: 'name', label: 'Name', align: 'left', field: row => this.getUserRealName(row) },
        { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
        { name: 'roles', label: 'Roles', align: 'left', field: row => row.userRoles?.map((r) => r.name).join(', ') },
        { name: 'posts', label: 'Posts', align: 'left', field: 'postsCount' },
    ];

    private created(): void {
        this.fetch();
    }

    @Watch('filter')
    private fetch(): void {
        this.onRequest({
            pagination: this.pagination,
            filter: this.filter,
        });
    }

    private async onRequest(props): Promise<void> {
        const { page, rowsPerPage, sortBy, descending } = props.pagination;
        const fetchCount = rowsPerPage === 0 ? '' : rowsPerPage;
        const startRow = (page - 1) * rowsPerPage;
        const filter = this.filter;

        await this.fetchPage({startRow, fetchCount, filter, sortBy, descending});

        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagination.rowsNumber = this.usersCount;
    }

    private getSelectedString(): string {
        return this.selected.length === 0 ? '' : `${this.selected.length} user${this.selected.length > 1 ? 's' : ''} selected of ${this.users.length}`
    }

    private getUserRealName(user: User): string {
        const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

        return name ?? '—';
    }

    private onDeleteDone() {
        this.confirmDelete = false;
        this.selected = [];
        this.fetch();
    }

    private singleDelete(user) {
        this.selected = [user];
        this.confirmDelete = true;
    }

}
</script>
