/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * @returns any No response body
   * @throws ApiError
   */
  public rootRetrieve(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/',
    });
  }
}
