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
                <div class="col col-sm-8 col-md-6 col-lg-4">
                    <UserForm v-if="user" :user.sync="user"/>
                </div>
            </div>
        </div>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title v-if="id">Editing user {{ usernameBackup ? usernameBackup : id }}</q-toolbar-title>
                <q-toolbar-title v-else>Add new user</q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import UserForm from 'components/user/UserForm.vue';
import User from 'src/model/interfaces/User';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserStore = namespace('User');
@Component({
    components: {UserForm}
})
export default class UserIndex extends Vue {
    @UserStore.Action private fetchUserById;

    @Prop()
    private id: number;

    private user: User = this.getNewUser();
    private usernameBackup = '';

    private async created() {
        if (this.id) {
            this.user = await this.fetchUserById(this.id);
            this.usernameBackup = this.user.username;
        }
    }

    private getNewUser(): User {
        return new class implements User {
            username = '';
            firstName = '';
            lastName = '';
            displayNameFormat = 'username';
            email = '';
            userRoles = [];
        }
    }
}
</script>
