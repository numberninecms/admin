<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div>
        <form class="q-gutter-md" @submit.prevent.stop="onSubmit">
            <q-input label="Username"
                     filled
                     v-model="user.username"
                     :readonly="user.id > 0" ref="username"
                     hint="Username can't be changed once user is created"
                     :debounce="300"
                     :rules="[isUsernameValid]"
                     :error-message="this.user.username.trim() ? 'This username is already in use' : 'Required'"/>
            <q-input label="Email"
                     filled
                     v-model="user.email"
                     ref="email"
                     type="email"
                     :debounce="300"
                     hint="Make sure email is valid to receive notifications"
                     :rules="[isEmailValid]"
                     :error-message="this.user.email.trim() ? 'This email is already in use' : 'Required'"/>
            <q-input label="Password"
                     filled
                     v-model="user.password"
                     v-if="!user.id"
                     :hint="passwordStrength"
                     :rules="[val => !!val || 'Required']"
                     :type="isPassword ? 'password' : 'text'">
                <template v-slot:append>
                    <q-icon
                        :name="isPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPassword = !isPassword"
                    />
                </template>
            </q-input>
            <q-input label="First name" filled v-model="user.firstName"/>
            <q-input label="Last name" filled v-model="user.lastName"/>
            <q-select
                label="Display name publicly as"
                filled
                map-options
                emit-value
                v-model="user.displayNameFormat"
                :options="options"
            />
            <q-select
                label="Roles"
                filled
                multiple
                option-label="name"
                option-value="id"
                v-model="user.userRoles"
                :options="roles"
            />

            <q-btn label="Save" type="submit" :loading="isLoading" color="primary"/>
            <q-btn label="Delete" :loading="isDeleting" color="negative" @click="confirmDelete = true" v-if="user.id"/>
        </form>

        <DeleteUserConfirm v-model="confirmDelete" :selected="[user]" @done="onDeleteDone" @close="confirmDelete = false"/>
    </div>
</template>

<script lang="ts">
import * as checkPasswordStrength from 'check-password-strength';
import DeleteUserConfirm from 'components/user/DeleteUserConfirm.vue';
import User from 'src/model/interfaces/User';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserStore = namespace('User');

@Component({
    components: {DeleteUserConfirm}
})
export default class UserForm extends Vue {
    @UserStore.State private roles;
    @UserStore.Action private queryRoles;
    @UserStore.Action private deleteUsers;
    @UserStore.Action private saveUser;
    @UserStore.Action private checkUsernameAvailability;
    @UserStore.Action private checkEmailAvailability;

    @Prop()
    private user: User;

    @Ref('username')
    private username;

    @Ref('email')
    private email;

    private isLoading = false;
    private isDeleting = false;
    private confirmDelete = false
    private initialEmail;
    private isPassword = true;

    private created() {
        this.queryRoles();
    }

    @Watch('user.id')
    private onUserChange() {
        this.initialEmail = this.user.email;
    }

    private get options() {
        const options: {label: string, value: string}[] = [];

        options.push({label: this.user.username, value: 'username'});

        if (this.user.firstName) {
            options.push({label: `${this.user.firstName}`, value: 'first_only'});
        }

        if (this.user.lastName) {
            options.push({label: `${this.user.lastName}`, value: 'last_only'});
        }

        if (this.user.firstName && this.user.lastName) {
            options.push(
                {label: `${this.user.firstName} ${this.user.lastName}`, value: 'first_last'},
                {label: `${this.user.lastName} ${this.user.firstName}`, value: 'last_first'}
            );
        }

        return options;
    }

    private onSubmit(): void {
        this.username.validate();
        this.email.validate();

        if (!this.username.hasError && !this.email.hasError) {
            this.saveUserAction();
        }
    }

    private async saveUserAction(): Promise<void> {
        this.isLoading = true;
        const newUser: User = await this.saveUser(this.user);
        this.isLoading = false;
        this.$router.push({name: 'user_edit', params: {id: (newUser.id ?? '').toString()}}).catch(() => { /**/ });
    }

    private onDeleteDone() {
        this.confirmDelete = false;
        this.$router.push('/users/').catch(() => { /**/ });
    }

    private async isUsernameFreeToUse(): Promise<boolean> {
        if (this.user.id) {
            return true;
        }

        if (!this.user.username.trim()) {
            return false;
        }

        return await this.checkUsernameAvailability(this.user.username);
    }

    private async isUsernameValid(): Promise<boolean> {
        return this.user.username.trim() !== '' && await this.isUsernameFreeToUse();
    }

    private async isEmailFreeToUse(): Promise<boolean> {
        if (this.user.email === this.initialEmail) {
            return true;
        }

        if (!this.user.email?.trim()) {
            return false;
        }

        return await this.checkEmailAvailability(this.user.email);
    }

    private async isEmailValid(): Promise<boolean> {
        return this.user.email?.trim() !== '' && await this.isEmailFreeToUse();
    }

    private get passwordStrength(): string {
        return !this.user.password ? '' : checkPasswordStrength(this.user.password).value;
    }
}
</script>
