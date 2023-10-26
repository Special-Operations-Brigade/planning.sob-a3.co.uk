import Vue from 'vue';
import VueX from 'vuex';
import { Feature, User as SharedUser, Marker } from '@/services/shared';
import FeatureService from './services/feature';
import { GradMap } from '@sob-a3/maps-frontend-utils/lib/leaflet';

Vue.use(VueX);

interface User extends SharedUser {
    remember: boolean;
}

export interface RootState {
    sessionId: string|null;
    features: Feature[];
    hiddenFeaturesIds: string[];
    user: User|null;
    map: GradMap|null;
    worldName: string;
    featureService: FeatureService|null;
    lastMarker: Marker|null;
}

export default new VueX.Store<RootState>({
    state: {
        sessionId: null,
        user: null,
        map: null,
        featureService: null,
        features: [],
        worldName: '',
        hiddenFeaturesIds: [],
        lastMarker: null
    },
    mutations: {
        setSessionId(state, id: string) {
            state.sessionId = id;
        },
        hideFeature(state, feature: Feature) {
            if (state.hiddenFeaturesIds.includes(feature.id)) return;
            state.hiddenFeaturesIds.push(feature.id);
        },
        unhideFeature(state, feature: Feature) {
            const index = state.hiddenFeaturesIds.indexOf(feature.id);
            if (index > -1) state.hiddenFeaturesIds.splice(index, 1);
        },
        setUser(state, user: User) {
            state.user = user;
        },
        setFeatures(state, features: Feature[]) {
            state.features = features;
        },
        setMap(state, map: GradMap) {
            state.map = map;
        },
        setWorldName(state, worldName: string) {
            state.worldName = worldName;
        },
        setFeatureService(state, service: FeatureService) {
            state.featureService = service;
        },
        setLastMarker(state, marker: Marker) {
            state.lastMarker = marker;
        }
    }
});
