import { GradMap } from '@sob-a3/maps-frontend-utils/lib/leaflet';

export default abstract class Tool extends EventTarget {
    protected map: GradMap;

    constructor(m: GradMap) {
        super();
        this.map = m;

        this.setup();
    }

    protected abstract setup(): void;
    public abstract destroy(): void;
}
