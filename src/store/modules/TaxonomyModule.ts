/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import GenericObject from 'src/model/interfaces/GenericObject';
import Taxonomy from 'src/model/interfaces/Taxonomy';
import Term from 'src/model/interfaces/Term';
import TermPage from 'src/model/interfaces/TermPage';
import { axios, axiosGeneric, Routing } from 'src/utils/routing';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import { pickBy, isUndefined } from 'lodash';

@Module({ namespaced: true })
export default class TaxonomyModule extends VuexModule {
    public taxonomies: Taxonomy[] = [];
    public terms: GenericObject<Term[]> = {};
    public termsCount: GenericObject<number> = {};
    public pagesCount: GenericObject<number> = {};
    public isLoading: GenericObject<boolean> = {};
    public alreadyFetchedPages: GenericObject<{terms, termsCount, pagesCount}> = {};

    @MutationAction({ mutate: ['taxonomies'] })
    private async fetchTaxonomies() {
        const response = await axios.get(Routing.generate('numbernine_admin_taxonomies_get_collection'));
        return { taxonomies: response.data };
    }

    @Action
    public async fetchTermPage(payload: TermPage) {
        const url = Routing.generate('numbernine_admin_terms_get_collection', pickBy({
            taxonomy: payload.taxonomy,
            startRow: payload.startRow,
            fetchCount: payload.fetchCount,
            filter: payload.filter,
            orderBy: payload.sortBy,
            order: payload.descending ? 'desc' : 'asc',
        }), !isUndefined);

        if (!Object.keys(this.alreadyFetchedPages).includes(url)) {
            this.context.commit('FETCHING', payload);
            const response = await axiosGeneric.getCollection<Term>(url);
            this.context.commit('FETCHING_SUCCESS', {taxonomy: payload.taxonomy, data: response, url});
        } else {
            this.context.commit('FETCH_FROM_HISTORY', {taxonomy: payload.taxonomy, url});
        }
    }

    @Action
    public async fetchTermById({id, taxonomy}) {
        return await axiosGeneric.getItem<Term>(Routing.generate('numbernine_admin_terms_get_item', {taxonomy, id}));
    }

    @Action
    public async saveTerm({taxonomy, term}) {
        if (term.id) {
            return await axiosGeneric.putItem<Term>(Routing.generate('numbernine_admin_terms_edit_item', {taxonomy, id: term.id}), {term});
        } else {
            const newTerm = await axiosGeneric.postItem<Term>(Routing.generate('numbernine_admin_terms_new_item', {taxonomy}), {term});
            this.context.commit('APPEND_TERM', {taxonomy, term: newTerm});
            return newTerm;
        }
    }

    @Action
    public async deleteTerms({taxonomy, terms}) {
        await axios.post(Routing.generate('numbernine_admin_terms_delete_collection', { taxonomy }), { ids: terms.map((e) => e.id) });
        this.context.commit('PURGE_ALREADY_FETCHED_PAGES_HISTORY');
    }

    @Mutation
    private FETCHING(payload: TermPage) {
        Vue.set(this.isLoading, payload.taxonomy, true);
    }

    @Mutation
    private FETCHING_SUCCESS(payload) {
        Vue.set(this.terms, payload.taxonomy, payload.data.collection);
        Vue.set(this.termsCount, payload.taxonomy, payload.data.totalItems);
        Vue.set(this.pagesCount, payload.taxonomy, payload.data.page.totalPages);
        Vue.set(this.isLoading, payload.taxonomy, false);

        if (!this.alreadyFetchedPages.hasOwnProperty(payload.url)) {
            Vue.set(this.alreadyFetchedPages, payload.url, []);
        }

        Vue.set(this.alreadyFetchedPages,payload.url, {
            terms: this.terms[payload.taxonomy],
            termsCount: this.termsCount[payload.taxonomy],
            pagesCount: this.pagesCount[payload.taxonomy],
        });
    }

    @Mutation
    private FETCH_FROM_HISTORY({taxonomy, url}) {
        Vue.set(this.terms, taxonomy, this.alreadyFetchedPages[url].terms);
        Vue.set(this.termsCount, taxonomy, this.alreadyFetchedPages[url].termsCount);
        Vue.set(this.pagesCount, taxonomy, this.alreadyFetchedPages[url].pagesCount);
    }

    @Mutation
    private PURGE_ALREADY_FETCHED_PAGES_HISTORY() {
        Vue.set(this, 'alreadyFetchedPages', {});
    }

    @Mutation
    private APPEND_TERM({taxonomy, term}) {
        if (!this.terms.hasOwnProperty(taxonomy)) {
            Vue.set(this.terms, taxonomy, []);
            Vue.set(this.termsCount, taxonomy, []);
        }

        this.terms[taxonomy].push(term);
        this.termsCount[taxonomy]++;
    }
}
