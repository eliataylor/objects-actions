/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PhoneNumber } from '../models/PhoneNumber';
import type { VerifyPhone } from '../models/VerifyPhone';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ObjectactionsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * @param requestBody
   * @returns any SMS sent successfully
   * @throws ApiError
   */
  public objectactionsAuthSmsCreate(
    requestBody: PhoneNumber,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/objectactions/auth/sms',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request`,
      },
    });
  }
  /**
   * @param requestBody
   * @returns any SMS sent successfully
   * @throws ApiError
   */
  public objectactionsAuthVerifySmsCreate(
    requestBody: VerifyPhone,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/objectactions/auth/verify-sms',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request`,
      },
    });
  }
}
