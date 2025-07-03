export interface SSEEvent {
type: string;
payload: {
    name: string;
    description: string;
    [key: string]: any;
};
}