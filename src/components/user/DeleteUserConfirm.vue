<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-dialog :value="value">
        <q-card>
            <q-card-section class="row items-center">
                <q-avatar icon="delete_forever" color="negative" text-color="white" />
                <span class="q-ml-sm" v-if="selected.length >= 1">Do you want to permanently delete selected user{{ selected.length > 1 ? 's' : ''}}?</span>
            </q-card-section>
            <q-card-section class="row justify-center">
                <q-list>
                    <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                            <q-radio v-model="associatedContent" val="reassign"/>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Reassign all associated content to current user</q-item-label>
                            <q-item-label caption>Comments won't be reassigned, but anonymized instead.</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                            <q-radio v-model="associatedContent" val="delete"/>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Delete all associated content</q-item-label>
                            <q-item-label caption>Comments won't be deleted, but anonymized instead.</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="No" color="secondary" @click="$emit('close')" />
                <q-btn flat :loading="deleteLoading" label="Yes" color="primary" @click="confirmDeleteAction" autofocus @keyup.enter="confirmDeleteAction"/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import User from 'src/model/interfaces/User';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserStore = namespace('User');

@Component
export default class DeleteUserConfirm extends Vue {
    @UserStore.Action private deleteUsers;

    @Prop()
    private value;

    @Prop()
    private selected: User[];

    private associatedContent = 'reassign';
    private deleteLoading = false;

    private async confirmDeleteAction() {
        this.deleteLoading = true;
        await this.deleteUsers({users: this.selected, associatedContent: this.associatedContent});
        this.deleteLoading = false;
        this.$emit('done');
    }
}
</script>
