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
        <div class="row">
            <div class="q-ma-md q-col-gutter-md col" v-if="rolesCopy" style="padding-top: 42px">
                <div class="row">
                    <div class="col col-sm-8 col-md-6 col-lg-4">
                        <q-input label="Add new role" filled v-model="newRole.name">
                            <template v-slot:after>
                                <q-btn class="full-height" color="primary" icon="add" @click="addRole" />
                            </template>
                        </q-input>
                    </div>
                </div>

                <div class="col">
                    <q-markup-table flat>
                        <thead>
                            <tr>
                                <th></th>
                                <th class="text-center" v-for="role in rolesCopy" :key="role.name">
                                    {{ role.name }}
                                    <q-btn v-if="!isBuiltInRole(role)"
                                           dense flat
                                           icon="delete_forever"
                                           color="negative"
                                           :loading="deleteLoading[role.name]"
                                           @click="deleteUserRole(role)"
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="capability in capabilities" :key="capability">
                                <td>{{ capability }}</td>
                                <td class="text-center" v-for="role in rolesCopy" :key="role.name">
                                    <q-checkbox :value="hasCapability(role, capability)" @input="updateRoleCapability(role, capability, $event)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                </div>

                <div>
                    <q-btn label="Save roles" color="primary" class="q-mt-lg" @click="saveUserRoles()" :loading="saveLoading"/>
                </div>
            </div>
        </div>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    Roles
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash';
import Role from 'src/model/interfaces/Role';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserStore = namespace('User');

@Component
export default class RoleIndex extends Vue {
    @UserStore.State private roles;
    @UserStore.State private capabilities;
    @UserStore.Action private queryRoles;
    @UserStore.Action private queryCapabilities;
    @UserStore.Action private saveRoles;
    @UserStore.Action private deleteRole;

    private rolesCopy: Role[] = [];
    private newRole = this.getNewRole();
    private deleteLoading: {[key: string]: boolean} = {};
    private saveLoading = false;

    private async created() {
        await Promise.all([
            this.queryRoles(),
            this.queryCapabilities(),
        ]);

        this.rolesCopy.splice(0, this.rolesCopy.length, ...cloneDeep(this.roles));
    }

    private getNewRole(): Role {
        return new class implements Role {
            name = '';
            capabilities: string[] = [];
        };
    }

    private addRole(): void {
        if (!this.newRole.name.trim()) {
            return;
        }

        this.rolesCopy.push(cloneDeep(this.newRole));
        this.newRole = this.getNewRole();
    }

    private hasCapability(role: Role, capability: string): boolean {
        return role.capabilities.includes(capability);
    }

    private updateRoleCapability(role: Role, capability: string, value: boolean): void {
        if (value && !this.hasCapability(role, capability)) {
            role.capabilities.push(capability);
        } else if (!value) {
            role.capabilities.splice(role.capabilities.indexOf(capability), 1);
        }
    }

    private isBuiltInRole(role: Role): boolean {
        return ['Subscriber', 'Contributor', 'Author', 'Editor', 'Administrator'].includes(role.name);
    }

    private async deleteUserRole(value: Role) {
        const role = cloneDeep(value);
        this.deleteLoading[role.name] = true;
        if (role.id) {
            await this.deleteRole(role);
        }
        this.rolesCopy.splice(this.rolesCopy.findIndex((r) => r.name === role.name), 1);
        this.deleteLoading[role.name] = false;
    }

    private async saveUserRoles() {
        this.saveLoading = true;
        await this.saveRoles(this.rolesCopy);
        this.saveLoading = false;
    }
}
</script>
