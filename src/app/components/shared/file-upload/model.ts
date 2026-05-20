export interface IUploadState {
    progressValue?: number;
    state: 'running' | 'error' | 'success';
    message?: string
}