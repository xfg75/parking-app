export interface Track {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
}

export interface PlatformAvailability {
    spotify: boolean;
    deezer: boolean;
    soundcloud: boolean;
    youtubeMusic: boolean;
    beatport: boolean;
}

export const MOCK_TRACKS: Track[] = [
    { id: '1', title: 'Losing It', artist: 'FISHER', coverUrl: 'https://picsum.photos/id/10/100' },
    { id: '2', title: 'Baddadan', artist: 'Chase & Status', coverUrl: 'https://picsum.photos/id/11/100' },
    { id: '3', title: 'Rhyme Dust', artist: 'MK, Dom Dolla', coverUrl: 'https://picsum.photos/id/12/100' },
    { id: '4', title: 'Atmosphere', artist: 'FISHER, Kita Alexander', coverUrl: 'https://picsum.photos/id/13/100' },
    { id: '5', title: 'Miracle', artist: 'Calvin Harris, Ellie Goulding', coverUrl: 'https://picsum.photos/id/14/100' },
];

export async function extractSongsFromInstagramUrl(url: string): Promise<Track[]> {
    console.log(`Extracting from: ${url}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_TRACKS);
        }, 2000);
    });
}

export async function searchTrackOnPlatforms(track: Track): Promise<PlatformAvailability> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                spotify: Math.random() > 0.2, // 80% chance
                deezer: Math.random() > 0.4,
                soundcloud: Math.random() > 0.1,
                youtubeMusic: Math.random() > 0.3,
                beatport: Math.random() > 0.5,
            });
        }, 1000 + Math.random() * 1000);
    });
}

export async function dispatchToSoundCloud(trackIds: string[]): Promise<boolean> {
    console.log(`Dispatching tracks to SoundCloud: ${trackIds.join(', ')}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true); // Always succeed for mock
        }, 1500);
    });
}
