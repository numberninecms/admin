/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PaginatedCollectionResponse from 'src/model/interfaces/PaginatedCollectionResponse';
import Role from 'src/model/interfaces/Role';
import User from 'src/model/interfaces/User';
import UserPage from 'src/model/interfaces/UserPage';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import { axios, axiosGeneric, Routing } from 'src/utils/routing';

@Module({ namespaced: true })
export default class UserModule extends VuexModule {
    public users: User[] = [];
    public usersCount = 0;
    public pagesCount = 0;
    public roles: Role[] = [];
    public capabilities: string[] = [];
    public isUserLoading = false;
    public isRoleLoading = false;

    @MutationAction({ mutate: ['roles', 'isRoleLoading'] })
    public async queryRoles() {
        this.isRoleLoading = true;
        const response = await axios.get(Routing.generate('numbernine_admin_user_roles_get_collection'));
        return { roles: response.data, isRoleLoading: false };
    }

    @MutationAction({ mutate: ['capabilities', 'isRoleLoading'] })
    public async queryCapabilities() {
        this.isRoleLoading = true;
        const response = await axios.get(Routing.generate('numbernine_admin_user_capabilities_get_collection'));
        return { capabilities: response.data, isRoleLoading: false };
    }

    @MutationAction({ mutate: ['roles', 'isRoleLoading'] })
    public async saveRoles(roles) {
        this.isRoleLoading = true;
        await axios.put(Routing.generate('numbernine_admin_user_roles_update_collection'), {roles});
        return { roles, isRoleLoading: false };
    }

    @Action
    public async deleteRole(role: Role) {
        await axios.delete(Routing.generate('numbernine_admin_user_roles_delete_item', {id: role.id}));
        this.context.commit('DELETE_ROLE', role);
    }

    @Action
    public async fetchPage(payload: UserPage) {
        this.context.commit('FETCHING');
        const response: PaginatedCollectionResponse<User> = await axiosGeneric.getCollection<User>(Routing.generate('numbernine_admin_users_get_collection', {
            startRow: payload.startRow,
            fetchCount: payload.fetchCount,
            filter: payload.filter,
            orderBy: payload.sortBy,
            order: payload.descending ? 'desc' : 'asc',
        }));
        this.context.commit('FETCHING_SUCCESS', { data: response, append: payload.append });
    }

    @Action
    public async deleteUsers({users, associatedContent}) {
        await axios.post(Routing.generate('numbernine_admin_users_delete_collection'), { ids: users.map((e) => e.id), associatedContent });
        this.context.commit('DELETING_SUCCESS', users);
    }

    @Action
    public async saveUser(user: User): Promise<User> {
        let response;

        if (user.id) {
            response = await axios.put(Routing.generate('numbernine_admin_users_update_item', {id: user.id}), {user});
        } else {
            response = await axios.post(Routing.generate('numbernine_admin_users_create_item'), {user});
        }

        return response.data;
    }

    @Action
    public async checkUsernameAvailability(username: string): Promise<boolean> {
        const response = await axios.get(Routing.generate('numbernine_admin_users_check_username_availability', {username}));
        return response.data;
    }

    @Action
    public async checkEmailAvailability(email: string): Promise<boolean> {
        const response = await axios.get(Routing.generate('numbernine_admin_users_check_email_availability', {email}));
        return response.data;
    }

    @Action
    public async fetchUserById(id): Promise<User> {
        const response = await axios.get(Routing.generate('numbernine_admin_users_get_item', {id}));
        return response.data;
    }

    @Mutation
    private FETCHING() {
        this.isUserLoading = true;
    }

    @Mutation
    private FETCHING_SUCCESS(payload) {
        if (payload.append) {
            this.users.push(...payload.data.collection);
        } else {
            this.users.splice(0, this.users.length, ...payload.data.collection);
        }
        this.usersCount = payload.data.totalItems;
        this.pagesCount = payload.data.page.totalPages;
        this.isUserLoading = false;
    }

    @Mutation
    private DELETING_SUCCESS(users) {
        for (const user of users) {
            this.users.splice(this.users.findIndex((e) => e.id === user.id), 1);
            this.usersCount--;
        }
    }

    @Mutation
    public DELETE_ROLE(role) {
        this.roles.splice(this.roles.findIndex((r) => r.id === role.id), 1);
    }
}
