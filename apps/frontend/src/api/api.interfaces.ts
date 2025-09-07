export interface IUrlParams {
    url: string;
    query?: Record<string, any>;
}

export interface IGetParams extends IUrlParams {
    headers?: Record<string, any>;
}

export interface IPostParams extends IUrlParams {
    method?: 'POST' | 'PUT'
    body?: any;
    headers?: Record<string, any>;
}
