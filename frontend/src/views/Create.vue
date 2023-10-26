<template>
    <div class="grad-create">
        <Loader v-if="loading" />
        <Error
            v-else-if="error"
            @button="fetchMaps"
            description="Feler beim Laden der Karten"
            button="Erneut versuchen!"
        />
        <template v-else>
            <router-link class="grad-create__back" tag="div" to="/">
                <i class="material-icons">arrow_back</i>
            </router-link>
            <div class="grad-create__filter">
                <i class="material-icons">search</i>
                <input type="text" v-model="filter" />
            </div>
            <div class="grad-create__maps-wrapper" v-if="filteredMaps.length > 0">
                <MapItem
                    v-for="m in filteredMaps"
                    :key="m.id"
                    :model="m"
                    @click.native="create(m)"
                />
            </div>
            <Error
                v-else
                style="grid-area: maps;"
                @button="fetchMaps"
                description="No maps found"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { createSession } from '@/services';
import MapItemVue from '@/components/Create/MapItem.vue';
import { fetchMaps, MapMetaData } from '@sob-a3/maps-frontend-utils';

type PartialMapMeta = Pick<MapMetaData, 'displayName' | 'worldName' | 'author'>;

@Component({
    components: {
        MapItem: MapItemVue
    }
})
export default class CreateVue extends Vue {
    private maps: PartialMapMeta[] = [];
    private loading: boolean = true;
    private error?: any;
    private filter: string = '';

    private created() {
        this.fetchMaps();
    }

    /**
     * Fetch avaliable maps
     */
    private async fetchMaps() {
        this.loading = true;
        this.error = undefined;

        try {
            this.maps = (await fetchMaps()).sort((a, b) => a.displayName.localeCompare(b.displayName));
        } catch (err) {
            this.error = err;
        }

        this.loading = false;
    }

    private async create(map: PartialMapMeta) {
        const id = await createSession(map.worldName);

        this.$router.push(`/join/${id}`);
    }

    private get filteredMaps(): PartialMapMeta[] {
        const filter = this.filter.toLowerCase();

        return this.maps.filter(m => m.displayName.toLowerCase().includes(filter));
    }
}
</script>

<style lang="scss" scoped>
@import '~@/colors.scss';
.grad-create {
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template:
        "back filter" auto
        "maps maps" 1fr / auto 1fr;
    height: 100vh;
    overflow: hidden;
    background-color: rgb($color-background);

    &__back {
        grid-area: back;
        cursor: pointer;
        font-size: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem;
        width: 3em;

        > i {
            opacity: 0.5;
            font-size: 1.5em;
            transition: opacity 0.1s ease-in-out;
        }

        &:hover > i {
            opacity: 1;
        }
    }

    &__filter {
        position: relative;
        margin: 1rem;
        font-size: 1.5rem;
        grid-area: filter;

        > i {
            position: absolute;
            top: 0px;
            left: 0px;
            bottom: 0px;
            width: 2.1em;
            height: auto;
            font-size: 1.5em;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0.5;
        }

        > input {
            color: rgb($color-text);
            background-color: rgb($color-divider);
            border-radius: 2.1em;
            padding: 1.5em 2em;
            border: none;
            font-weight: 600;
            outline: none;
            line-height: 1.2em;
            height: auto;
            box-sizing: border-box;
            font-size: 0.75em;
            width: 100%;
            padding-left: 4.2em;
            margin: 0px;
        }
    }

    &__maps-wrapper {
        padding: 1rem;
        display: grid;
        align-content: flex-start;
        justify-items: center;
        flex-shrink: 1;
        overflow-y: auto;
        overflow-x: hidden;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        grid-area: maps;

        &::-webkit-scrollbar-thumb
        {
            background-color: rgba($color-active, 0.3);
            border-radius: 3px;
        }

    }
}
</style>
