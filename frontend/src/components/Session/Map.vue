<template>
<div style="position: fixed; top: 0px; left: 0px; bottom: 0px; right: 0px;" ref="map"></div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
    Map as LeafletMap,
    TileLayer,
    LeafletMouseEvent,
    Layer as LeafletLayer,
    LeafletEvent,
    Popup as LeafletPopup
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { WebSocketController } from '@/services/websocket';
import { Feature, Line, Comment, Marker, Pointing } from '@/services/shared';
import { LineString } from 'geojson';

import LineFeature from '@/features/Line';
import CommentFeature from '@/features/Comment';
import PointingFeature from '@/features/Pointing';
import MarkerFeature from '@/features/Marker';

import deepEqual from 'deep-equal';
import { mapState } from 'vuex';
import { GradMap } from '@sob-a3/maps-frontend-utils/lib/leaflet';

@Component({
    computed: {
        ...mapState({
            features: (state: any) => state.features,
            hiddenFeaturesIds: (state: any) => state.hiddenFeaturesIds
        })
    }
})
export default class MapVue extends Vue {
    @Prop({ default: null }) private value!: LeafletMap|null;

    @Prop({ required: true }) private controller!: WebSocketController;
    @Prop({ required: true }) private mapId!: string;
    private features!: Feature[];
    private hiddenFeaturesIds!: string[];

    private hoverFeatures: Map<string, Feature> = new Map();

    private featureLayers: Map<string, { feature: Feature, layer: LeafletLayer }> = new Map();

    // helper functions for v-model
    // just use this.map to access it
    private get map() { return this.value; }
    private set map(val: LeafletMap|null) { this.$emit('input', val); }

    private mounted() {
        this.initMap();
    }

    private beforeDestroy() {
        if (this.map) this.map.remove();
    }

    /**
     * This methods sets up the leafelt map.
     */
    @Watch('$store.state.worldName')
    private async initMap() {
        const worldName = this.$tstore.state.worldName;

        if (worldName.length === 0) return;

        if (this.map !== null) {
            this.map.remove();
        }

        try {
            this.map = await new GradMap(
                worldName,
                this.$refs.map as HTMLDivElement,
                {
                    attributionControl: false,
                    zoomControl: false,
                    doubleClickZoom: false
                }
            );
        } catch (err) {
            if (err.response && err.response instanceof Response) {
                if (err.response.status === 404) {
                    // eslint-disable-next-line no-console
                    console.error(`Couldn't find map with worldname "${worldName}"`);
                } else {
                    // eslint-disable-next-line no-console
                    console.error(`Server responded with status ${err.response.status}`);
                }
            } else {
                // eslint-disable-next-line no-console
                console.error(err);
            }
        }
    }

    @Watch('map')
    private setupMap() {
        if (this.map === null) return;

        this.$tstore.commit('setMap', this.map);
        this.map.setView([0, 0], 0);
    }

    @Watch('map')
    @Watch('popup')
    @Watch('features', { deep: true })
    @Watch('hiddenFeaturesIds', { deep: true })
    private drawFeatures() {
        if (!this.map) return;

        const featuresToRedraw: Feature[] = [];
        const oldFeatureIds = Array.from(this.featureLayers.keys());

        for (const f of this.features) {
            const id = f.id;

            if (this.hiddenFeaturesIds.includes(id)) continue;

            if (!this.featureLayers.has(id)) {
                // completely new feature
                featuresToRedraw.push(f);
                continue;
            }

            const oldFeature = this.featureLayers.get(id)!;
            if (!deepEqual(f, oldFeature.feature)) {
                // feature changed
                oldFeature.layer.remove();
                featuresToRedraw.push(f);
            }

            // remove id from array
            oldFeatureIds.splice(oldFeatureIds.indexOf(id), 1);
        }

        // remove every feature which wasn't included in new features
        for (const id of oldFeatureIds) {
            const values = this.featureLayers.get(id)!;
            values.layer.remove();
            this.featureLayers.delete(id);
        }

        featuresToRedraw.forEach(f => {
            let layer: LeafletLayer|null = null;

            switch (f.type) {
            case 'line':
                layer = new LineFeature(f as Line).addTo(this.map!);
                break;
            case 'comment':
                layer = new CommentFeature(f as Comment).addTo(this.map!);
                break;
            case 'marker':
                layer = new MarkerFeature(f as Marker).addTo(this.map!);
                break;
            case 'pointing':
                layer = new PointingFeature(f as Pointing).addTo(this.map!);
                break;
            default:
                break;
            }

            if (layer) {
                layer.on('mouseover', () => this.onFeatureMouseOver(f));
                layer.on('mouseout', () => this.onFeatureMouseOut(f));
                layer.on('remove', () => this.onFeatureMouseOut(f));

                this.featureLayers.set(f.id, { feature: f, layer });
            };
        });
    }

    private onFeatureMouseOver(f: Feature) {
        this.hoverFeatures.set(f.id, f);

        this.updateHighlightFeature();
    }

    private onFeatureMouseOut(f: Feature) {
        if (this.hoverFeatures.has(f.id)) {
            this.hoverFeatures.delete(f.id);
        }

        this.updateHighlightFeature();
    }

    private updateHighlightFeature() {
        this.$emit('highlight-feature', this.hoverFeatures.values().next().value || null);
    }
}
</script>
