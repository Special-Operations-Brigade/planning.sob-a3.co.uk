export const API_DOMAIN = 'planning.gruppe-adler.de';
const API_URL = `https://${API_DOMAIN}/api`;
// const API_URL = `${location.origin}/api`

export async function makeJSONRequest<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    init = Object.assign({
        headers: {
            'Content-Type': 'application/json'
        }
    }, init);

    const res = await fetch(input, init);

    if (!res.ok) throw res;

    const body: T = await res.json();

    return body;
}

/**
 * Create new session for given map
 * @param mapId map to create session for
 * @returns id of created session
 */
export const createSession = async (mapId: string): Promise<string> => {
    const body = await makeJSONRequest<{ id: string }>(`${API_URL}/session`, {
        method: 'POST',
        body: JSON.stringify({ map: mapId })
    });

    return body.id;
};
