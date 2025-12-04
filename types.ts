export interface AnalysisState {
    isLoading: boolean;
    data: string | null; // We will use Markdown string as the data source
    error: string | null;
}

export type InputMode = 'text' | 'image';

export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
}