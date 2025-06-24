/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionPlans } from '../models/ActionPlans';
import type { ActionPlansRequest } from '../models/ActionPlansRequest';
import type { Attendees } from '../models/Attendees';
import type { AttendeesRequest } from '../models/AttendeesRequest';
import type { Cities } from '../models/Cities';
import type { CitiesRequest } from '../models/CitiesRequest';
import type { Invites } from '../models/Invites';
import type { InvitesRequest } from '../models/InvitesRequest';
import type { Meetings } from '../models/Meetings';
import type { MeetingsRequest } from '../models/MeetingsRequest';
import type { MeetingTypes } from '../models/MeetingTypes';
import type { MeetingTypesRequest } from '../models/MeetingTypesRequest';
import type { OATester } from '../models/OATester';
import type { OATesterRequest } from '../models/OATesterRequest';
import type { Officials } from '../models/Officials';
import type { OfficialsRequest } from '../models/OfficialsRequest';
import type { PaginatedActionPlansList } from '../models/PaginatedActionPlansList';
import type { PaginatedAttendeesList } from '../models/PaginatedAttendeesList';
import type { PaginatedCitiesList } from '../models/PaginatedCitiesList';
import type { PaginatedInvitesList } from '../models/PaginatedInvitesList';
import type { PaginatedMeetingsList } from '../models/PaginatedMeetingsList';
import type { PaginatedMeetingTypesList } from '../models/PaginatedMeetingTypesList';
import type { PaginatedOATesterList } from '../models/PaginatedOATesterList';
import type { PaginatedOfficialsList } from '../models/PaginatedOfficialsList';
import type { PaginatedPartiesList } from '../models/PaginatedPartiesList';
import type { PaginatedRalliesList } from '../models/PaginatedRalliesList';
import type { PaginatedResourcesList } from '../models/PaginatedResourcesList';
import type { PaginatedResourceTypesList } from '../models/PaginatedResourceTypesList';
import type { PaginatedRoomsList } from '../models/PaginatedRoomsList';
import type { PaginatedSchemaVersionList } from '../models/PaginatedSchemaVersionList';
import type { PaginatedStakeholdersList } from '../models/PaginatedStakeholdersList';
import type { PaginatedStatesList } from '../models/PaginatedStatesList';
import type { PaginatedSubscriptionsList } from '../models/PaginatedSubscriptionsList';
import type { PaginatedTopicsList } from '../models/PaginatedTopicsList';
import type { PaginatedUsersList } from '../models/PaginatedUsersList';
import type { Parties } from '../models/Parties';
import type { PartiesRequest } from '../models/PartiesRequest';
import type { PatchedActionPlansRequest } from '../models/PatchedActionPlansRequest';
import type { PatchedAttendeesRequest } from '../models/PatchedAttendeesRequest';
import type { PatchedCitiesRequest } from '../models/PatchedCitiesRequest';
import type { PatchedInvitesRequest } from '../models/PatchedInvitesRequest';
import type { PatchedMeetingsRequest } from '../models/PatchedMeetingsRequest';
import type { PatchedMeetingTypesRequest } from '../models/PatchedMeetingTypesRequest';
import type { PatchedOATesterRequest } from '../models/PatchedOATesterRequest';
import type { PatchedOfficialsRequest } from '../models/PatchedOfficialsRequest';
import type { PatchedPartiesRequest } from '../models/PatchedPartiesRequest';
import type { PatchedRalliesRequest } from '../models/PatchedRalliesRequest';
import type { PatchedResourcesRequest } from '../models/PatchedResourcesRequest';
import type { PatchedResourceTypesRequest } from '../models/PatchedResourceTypesRequest';
import type { PatchedRoomsRequest } from '../models/PatchedRoomsRequest';
import type { PatchedSchemaVersionRequest } from '../models/PatchedSchemaVersionRequest';
import type { PatchedStakeholdersRequest } from '../models/PatchedStakeholdersRequest';
import type { PatchedStatesRequest } from '../models/PatchedStatesRequest';
import type { PatchedSubscriptionsRequest } from '../models/PatchedSubscriptionsRequest';
import type { PatchedTopicsRequest } from '../models/PatchedTopicsRequest';
import type { PatchedUsersRequest } from '../models/PatchedUsersRequest';
import type { Rallies } from '../models/Rallies';
import type { RalliesRequest } from '../models/RalliesRequest';
import type { Resources } from '../models/Resources';
import type { ResourcesRequest } from '../models/ResourcesRequest';
import type { ResourceTypes } from '../models/ResourceTypes';
import type { ResourceTypesRequest } from '../models/ResourceTypesRequest';
import type { Rooms } from '../models/Rooms';
import type { RoomsRequest } from '../models/RoomsRequest';
import type { SchemaVersion } from '../models/SchemaVersion';
import type { SchemaVersionRequest } from '../models/SchemaVersionRequest';
import type { Stakeholders } from '../models/Stakeholders';
import type { StakeholdersRequest } from '../models/StakeholdersRequest';
import type { States } from '../models/States';
import type { StatesRequest } from '../models/StatesRequest';
import type { Subscriptions } from '../models/Subscriptions';
import type { SubscriptionsRequest } from '../models/SubscriptionsRequest';
import type { Topics } from '../models/Topics';
import type { TopicsRequest } from '../models/TopicsRequest';
import type { Users } from '../models/Users';
import type { UsersRequest } from '../models/UsersRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ApiService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedActionPlansList
   * @throws ApiError
   */
  public apiActionPlansList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedActionPlansList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/action-plans',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns ActionPlans
   * @throws ApiError
   */
  public apiActionPlansCreate(
    requestBody: ActionPlansRequest,
  ): CancelablePromise<ActionPlans> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/action-plans',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Action Plan.
   * @returns ActionPlans
   * @throws ApiError
   */
  public apiActionPlansRetrieve(
    id: number,
  ): CancelablePromise<ActionPlans> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/action-plans/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Action Plan.
   * @param requestBody
   * @returns ActionPlans
   * @throws ApiError
   */
  public apiActionPlansUpdate(
    id: number,
    requestBody: ActionPlansRequest,
  ): CancelablePromise<ActionPlans> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/action-plans/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Action Plan.
   * @param requestBody
   * @returns ActionPlans
   * @throws ApiError
   */
  public apiActionPlansPartialUpdate(
    id: number,
    requestBody?: PatchedActionPlansRequest,
  ): CancelablePromise<ActionPlans> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/action-plans/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Action Plan.
   * @returns void
   * @throws ApiError
   */
  public apiActionPlansDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/action-plans/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @returns PaginatedAttendeesList
   * @throws ApiError
   */
  public apiAttendeesList(
    limit?: number,
    offset?: number,
  ): CancelablePromise<PaginatedAttendeesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/attendees',
      query: {
        'limit': limit,
        'offset': offset,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Attendees
   * @throws ApiError
   */
  public apiAttendeesCreate(
    requestBody: AttendeesRequest,
  ): CancelablePromise<Attendees> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/attendees',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Attendee.
   * @returns Attendees
   * @throws ApiError
   */
  public apiAttendeesRetrieve(
    id: number,
  ): CancelablePromise<Attendees> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/attendees/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Attendee.
   * @param requestBody
   * @returns Attendees
   * @throws ApiError
   */
  public apiAttendeesUpdate(
    id: number,
    requestBody: AttendeesRequest,
  ): CancelablePromise<Attendees> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/attendees/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Attendee.
   * @param requestBody
   * @returns Attendees
   * @throws ApiError
   */
  public apiAttendeesPartialUpdate(
    id: number,
    requestBody?: PatchedAttendeesRequest,
  ): CancelablePromise<Attendees> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/attendees/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Attendee.
   * @returns void
   * @throws ApiError
   */
  public apiAttendeesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/attendees/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedCitiesList
   * @throws ApiError
   */
  public apiCitiesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedCitiesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/cities',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Cities
   * @throws ApiError
   */
  public apiCitiesCreate(
    requestBody: CitiesRequest,
  ): CancelablePromise<Cities> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/cities',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this City.
   * @returns Cities
   * @throws ApiError
   */
  public apiCitiesRetrieve(
    id: number,
  ): CancelablePromise<Cities> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/cities/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this City.
   * @param requestBody
   * @returns Cities
   * @throws ApiError
   */
  public apiCitiesUpdate(
    id: number,
    requestBody: CitiesRequest,
  ): CancelablePromise<Cities> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/cities/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this City.
   * @param requestBody
   * @returns Cities
   * @throws ApiError
   */
  public apiCitiesPartialUpdate(
    id: number,
    requestBody?: PatchedCitiesRequest,
  ): CancelablePromise<Cities> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/cities/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this City.
   * @returns void
   * @throws ApiError
   */
  public apiCitiesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/cities/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedInvitesList
   * @throws ApiError
   */
  public apiInvitesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedInvitesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/invites',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Invites
   * @throws ApiError
   */
  public apiInvitesCreate(
    requestBody: InvitesRequest,
  ): CancelablePromise<Invites> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/invites',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Invite.
   * @returns Invites
   * @throws ApiError
   */
  public apiInvitesRetrieve(
    id: number,
  ): CancelablePromise<Invites> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/invites/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Invite.
   * @param requestBody
   * @returns Invites
   * @throws ApiError
   */
  public apiInvitesUpdate(
    id: number,
    requestBody: InvitesRequest,
  ): CancelablePromise<Invites> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/invites/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Invite.
   * @param requestBody
   * @returns Invites
   * @throws ApiError
   */
  public apiInvitesPartialUpdate(
    id: number,
    requestBody?: PatchedInvitesRequest,
  ): CancelablePromise<Invites> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/invites/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Invite.
   * @returns void
   * @throws ApiError
   */
  public apiInvitesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/invites/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedMeetingTypesList
   * @throws ApiError
   */
  public apiMeetingTypesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedMeetingTypesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/meeting-types',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns MeetingTypes
   * @throws ApiError
   */
  public apiMeetingTypesCreate(
    requestBody?: MeetingTypesRequest,
  ): CancelablePromise<MeetingTypes> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/meeting-types',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting Type.
   * @returns MeetingTypes
   * @throws ApiError
   */
  public apiMeetingTypesRetrieve(
    id: number,
  ): CancelablePromise<MeetingTypes> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/meeting-types/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting Type.
   * @param requestBody
   * @returns MeetingTypes
   * @throws ApiError
   */
  public apiMeetingTypesUpdate(
    id: number,
    requestBody?: MeetingTypesRequest,
  ): CancelablePromise<MeetingTypes> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/meeting-types/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting Type.
   * @param requestBody
   * @returns MeetingTypes
   * @throws ApiError
   */
  public apiMeetingTypesPartialUpdate(
    id: number,
    requestBody?: PatchedMeetingTypesRequest,
  ): CancelablePromise<MeetingTypes> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/meeting-types/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting Type.
   * @returns void
   * @throws ApiError
   */
  public apiMeetingTypesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/meeting-types/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedMeetingsList
   * @throws ApiError
   */
  public apiMeetingsList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedMeetingsList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/meetings',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Meetings
   * @throws ApiError
   */
  public apiMeetingsCreate(
    requestBody: MeetingsRequest,
  ): CancelablePromise<Meetings> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/meetings',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting.
   * @returns Meetings
   * @throws ApiError
   */
  public apiMeetingsRetrieve(
    id: number,
  ): CancelablePromise<Meetings> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/meetings/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting.
   * @param requestBody
   * @returns Meetings
   * @throws ApiError
   */
  public apiMeetingsUpdate(
    id: number,
    requestBody: MeetingsRequest,
  ): CancelablePromise<Meetings> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/meetings/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting.
   * @param requestBody
   * @returns Meetings
   * @throws ApiError
   */
  public apiMeetingsPartialUpdate(
    id: number,
    requestBody?: PatchedMeetingsRequest,
  ): CancelablePromise<Meetings> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/meetings/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Meeting.
   * @returns void
   * @throws ApiError
   */
  public apiMeetingsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/meetings/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * List all users in the 'oa-tester' group.
   * @param page A page number within the paginated result set.
   * @param pageSize Number of results to return per page.
   * @returns PaginatedOATesterList
   * @throws ApiError
   */
  public apiOaTestersList(
    page?: number,
    pageSize?: number,
  ): CancelablePromise<PaginatedOATesterList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/oa-testers',
      query: {
        'page': page,
        'page_size': pageSize,
      },
    });
  }
  /**
   * Create a new user and add them to the 'oa-tester' group.
   * @param requestBody
   * @returns OATester
   * @throws ApiError
   */
  public apiOaTestersCreate(
    requestBody: OATesterRequest,
  ): CancelablePromise<OATester> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/oa-testers',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieve a specific 'oa-tester' user by ID.
   * @param id A unique integer value identifying this User.
   * @returns OATester
   * @throws ApiError
   */
  public apiOaTestersRetrieve(
    id: number,
  ): CancelablePromise<OATester> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/oa-testers/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * Add the 'oa-tester' group to a specific user by ID.
   * @param id A unique integer value identifying this User.
   * @param requestBody
   * @returns OATester
   * @throws ApiError
   */
  public apiOaTestersUpdate(
    id: number,
    requestBody: OATesterRequest,
  ): CancelablePromise<OATester> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/oa-testers/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Add the 'oa-tester' group to a specific user by ID.
   * @param id A unique integer value identifying this User.
   * @param requestBody
   * @returns OATester
   * @throws ApiError
   */
  public apiOaTestersPartialUpdate(
    id: number,
    requestBody?: PatchedOATesterRequest,
  ): CancelablePromise<OATester> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/oa-testers/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete a specific 'oa-tester' user by ID, along with their content.
   * @param id A unique integer value identifying this User.
   * @returns void
   * @throws ApiError
   */
  public apiOaTestersDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/oa-testers/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns OATester
   * @throws ApiError
   */
  public apiOaTestersSearchRetrieve(): CancelablePromise<OATester> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/oa-testers/search',
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedOfficialsList
   * @throws ApiError
   */
  public apiOfficialsList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedOfficialsList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/officials',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Officials
   * @throws ApiError
   */
  public apiOfficialsCreate(
    requestBody: OfficialsRequest,
  ): CancelablePromise<Officials> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/officials',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Official.
   * @returns Officials
   * @throws ApiError
   */
  public apiOfficialsRetrieve(
    id: number,
  ): CancelablePromise<Officials> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/officials/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Official.
   * @param requestBody
   * @returns Officials
   * @throws ApiError
   */
  public apiOfficialsUpdate(
    id: number,
    requestBody: OfficialsRequest,
  ): CancelablePromise<Officials> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/officials/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Official.
   * @param requestBody
   * @returns Officials
   * @throws ApiError
   */
  public apiOfficialsPartialUpdate(
    id: number,
    requestBody?: PatchedOfficialsRequest,
  ): CancelablePromise<Officials> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/officials/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Official.
   * @returns void
   * @throws ApiError
   */
  public apiOfficialsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/officials/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedPartiesList
   * @throws ApiError
   */
  public apiPartiesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedPartiesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/parties',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Parties
   * @throws ApiError
   */
  public apiPartiesCreate(
    requestBody?: PartiesRequest,
  ): CancelablePromise<Parties> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/parties',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Party.
   * @returns Parties
   * @throws ApiError
   */
  public apiPartiesRetrieve(
    id: number,
  ): CancelablePromise<Parties> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/parties/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Party.
   * @param requestBody
   * @returns Parties
   * @throws ApiError
   */
  public apiPartiesUpdate(
    id: number,
    requestBody?: PartiesRequest,
  ): CancelablePromise<Parties> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/parties/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Party.
   * @param requestBody
   * @returns Parties
   * @throws ApiError
   */
  public apiPartiesPartialUpdate(
    id: number,
    requestBody?: PatchedPartiesRequest,
  ): CancelablePromise<Parties> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/parties/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Party.
   * @returns void
   * @throws ApiError
   */
  public apiPartiesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/parties/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedRalliesList
   * @throws ApiError
   */
  public apiRalliesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedRalliesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/rallies',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Rallies
   * @throws ApiError
   */
  public apiRalliesCreate(
    requestBody: RalliesRequest,
  ): CancelablePromise<Rallies> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/rallies',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Rally.
   * @returns Rallies
   * @throws ApiError
   */
  public apiRalliesRetrieve(
    id: number,
  ): CancelablePromise<Rallies> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/rallies/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Rally.
   * @param requestBody
   * @returns Rallies
   * @throws ApiError
   */
  public apiRalliesUpdate(
    id: number,
    requestBody: RalliesRequest,
  ): CancelablePromise<Rallies> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/rallies/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Rally.
   * @param requestBody
   * @returns Rallies
   * @throws ApiError
   */
  public apiRalliesPartialUpdate(
    id: number,
    requestBody?: PatchedRalliesRequest,
  ): CancelablePromise<Rallies> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/rallies/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Rally.
   * @returns void
   * @throws ApiError
   */
  public apiRalliesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/rallies/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedResourceTypesList
   * @throws ApiError
   */
  public apiResourceTypesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedResourceTypesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/resource-types',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns ResourceTypes
   * @throws ApiError
   */
  public apiResourceTypesCreate(
    requestBody?: ResourceTypesRequest,
  ): CancelablePromise<ResourceTypes> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/resource-types',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource Type.
   * @returns ResourceTypes
   * @throws ApiError
   */
  public apiResourceTypesRetrieve(
    id: number,
  ): CancelablePromise<ResourceTypes> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/resource-types/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Resource Type.
   * @param requestBody
   * @returns ResourceTypes
   * @throws ApiError
   */
  public apiResourceTypesUpdate(
    id: number,
    requestBody?: ResourceTypesRequest,
  ): CancelablePromise<ResourceTypes> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/resource-types/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource Type.
   * @param requestBody
   * @returns ResourceTypes
   * @throws ApiError
   */
  public apiResourceTypesPartialUpdate(
    id: number,
    requestBody?: PatchedResourceTypesRequest,
  ): CancelablePromise<ResourceTypes> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/resource-types/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource Type.
   * @returns void
   * @throws ApiError
   */
  public apiResourceTypesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/resource-types/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedResourcesList
   * @throws ApiError
   */
  public apiResourcesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedResourcesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/resources',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Resources
   * @throws ApiError
   */
  public apiResourcesCreate(
    requestBody: ResourcesRequest,
  ): CancelablePromise<Resources> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/resources',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource.
   * @returns Resources
   * @throws ApiError
   */
  public apiResourcesRetrieve(
    id: number,
  ): CancelablePromise<Resources> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/resources/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Resource.
   * @param requestBody
   * @returns Resources
   * @throws ApiError
   */
  public apiResourcesUpdate(
    id: number,
    requestBody: ResourcesRequest,
  ): CancelablePromise<Resources> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/resources/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource.
   * @param requestBody
   * @returns Resources
   * @throws ApiError
   */
  public apiResourcesPartialUpdate(
    id: number,
    requestBody?: PatchedResourcesRequest,
  ): CancelablePromise<Resources> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/resources/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Resource.
   * @returns void
   * @throws ApiError
   */
  public apiResourcesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/resources/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedRoomsList
   * @throws ApiError
   */
  public apiRoomsList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedRoomsList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/rooms',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Rooms
   * @throws ApiError
   */
  public apiRoomsCreate(
    requestBody: RoomsRequest,
  ): CancelablePromise<Rooms> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/rooms',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Room.
   * @returns Rooms
   * @throws ApiError
   */
  public apiRoomsRetrieve(
    id: number,
  ): CancelablePromise<Rooms> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/rooms/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Room.
   * @param requestBody
   * @returns Rooms
   * @throws ApiError
   */
  public apiRoomsUpdate(
    id: number,
    requestBody: RoomsRequest,
  ): CancelablePromise<Rooms> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/rooms/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Room.
   * @param requestBody
   * @returns Rooms
   * @throws ApiError
   */
  public apiRoomsPartialUpdate(
    id: number,
    requestBody?: PatchedRoomsRequest,
  ): CancelablePromise<Rooms> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/rooms/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Room.
   * @returns void
   * @throws ApiError
   */
  public apiRoomsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/rooms/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedStakeholdersList
   * @throws ApiError
   */
  public apiStakeholdersList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedStakeholdersList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/stakeholders',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Stakeholders
   * @throws ApiError
   */
  public apiStakeholdersCreate(
    requestBody?: StakeholdersRequest,
  ): CancelablePromise<Stakeholders> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/stakeholders',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Stakeholder.
   * @returns Stakeholders
   * @throws ApiError
   */
  public apiStakeholdersRetrieve(
    id: number,
  ): CancelablePromise<Stakeholders> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/stakeholders/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Stakeholder.
   * @param requestBody
   * @returns Stakeholders
   * @throws ApiError
   */
  public apiStakeholdersUpdate(
    id: number,
    requestBody?: StakeholdersRequest,
  ): CancelablePromise<Stakeholders> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/stakeholders/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Stakeholder.
   * @param requestBody
   * @returns Stakeholders
   * @throws ApiError
   */
  public apiStakeholdersPartialUpdate(
    id: number,
    requestBody?: PatchedStakeholdersRequest,
  ): CancelablePromise<Stakeholders> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/stakeholders/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Stakeholder.
   * @returns void
   * @throws ApiError
   */
  public apiStakeholdersDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/stakeholders/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedStatesList
   * @throws ApiError
   */
  public apiStatesList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedStatesList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/states',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns States
   * @throws ApiError
   */
  public apiStatesCreate(
    requestBody?: StatesRequest,
  ): CancelablePromise<States> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/states',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this State.
   * @returns States
   * @throws ApiError
   */
  public apiStatesRetrieve(
    id: number,
  ): CancelablePromise<States> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/states/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this State.
   * @param requestBody
   * @returns States
   * @throws ApiError
   */
  public apiStatesUpdate(
    id: number,
    requestBody?: StatesRequest,
  ): CancelablePromise<States> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/states/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this State.
   * @param requestBody
   * @returns States
   * @throws ApiError
   */
  public apiStatesPartialUpdate(
    id: number,
    requestBody?: PatchedStatesRequest,
  ): CancelablePromise<States> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/states/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this State.
   * @returns void
   * @throws ApiError
   */
  public apiStatesDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/states/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedSubscriptionsList
   * @throws ApiError
   */
  public apiSubscriptionsList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedSubscriptionsList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/subscriptions',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Subscriptions
   * @throws ApiError
   */
  public apiSubscriptionsCreate(
    requestBody: SubscriptionsRequest,
  ): CancelablePromise<Subscriptions> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/subscriptions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Subscription.
   * @returns Subscriptions
   * @throws ApiError
   */
  public apiSubscriptionsRetrieve(
    id: number,
  ): CancelablePromise<Subscriptions> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/subscriptions/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Subscription.
   * @param requestBody
   * @returns Subscriptions
   * @throws ApiError
   */
  public apiSubscriptionsUpdate(
    id: number,
    requestBody: SubscriptionsRequest,
  ): CancelablePromise<Subscriptions> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/subscriptions/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Subscription.
   * @param requestBody
   * @returns Subscriptions
   * @throws ApiError
   */
  public apiSubscriptionsPartialUpdate(
    id: number,
    requestBody?: PatchedSubscriptionsRequest,
  ): CancelablePromise<Subscriptions> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/subscriptions/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Subscription.
   * @returns void
   * @throws ApiError
   */
  public apiSubscriptionsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/subscriptions/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedTopicsList
   * @throws ApiError
   */
  public apiTopicsList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedTopicsList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/topics',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Topics
   * @throws ApiError
   */
  public apiTopicsCreate(
    requestBody?: TopicsRequest,
  ): CancelablePromise<Topics> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/topics',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Topic.
   * @returns Topics
   * @throws ApiError
   */
  public apiTopicsRetrieve(
    id: number,
  ): CancelablePromise<Topics> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/topics/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Topic.
   * @param requestBody
   * @returns Topics
   * @throws ApiError
   */
  public apiTopicsUpdate(
    id: number,
    requestBody?: TopicsRequest,
  ): CancelablePromise<Topics> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/topics/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Topic.
   * @param requestBody
   * @returns Topics
   * @throws ApiError
   */
  public apiTopicsPartialUpdate(
    id: number,
    requestBody?: PatchedTopicsRequest,
  ): CancelablePromise<Topics> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/topics/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Topic.
   * @returns void
   * @throws ApiError
   */
  public apiTopicsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/topics/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @param search A search term.
   * @returns PaginatedUsersList
   * @throws ApiError
   */
  public apiUsersList(
    limit?: number,
    offset?: number,
    search?: string,
  ): CancelablePromise<PaginatedUsersList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/users',
      query: {
        'limit': limit,
        'offset': offset,
        'search': search,
      },
    });
  }
  /**
   * @param requestBody
   * @returns Users
   * @throws ApiError
   */
  public apiUsersCreate(
    requestBody: UsersRequest,
  ): CancelablePromise<Users> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/users',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this User.
   * @returns Users
   * @throws ApiError
   */
  public apiUsersRetrieve(
    id: number,
  ): CancelablePromise<Users> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/users/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this User.
   * @param requestBody
   * @returns Users
   * @throws ApiError
   */
  public apiUsersUpdate(
    id: number,
    requestBody: UsersRequest,
  ): CancelablePromise<Users> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/users/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this User.
   * @param requestBody
   * @returns Users
   * @throws ApiError
   */
  public apiUsersPartialUpdate(
    id: number,
    requestBody?: PatchedUsersRequest,
  ): CancelablePromise<Users> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/users/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this User.
   * @returns void
   * @throws ApiError
   */
  public apiUsersDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/users/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param modelName
   * @param userId
   * @param search Search term
   * @returns any
   * @throws ApiError
   */
  public apiUsersListRetrieve(
    modelName: string,
    userId: number,
    search?: string,
  ): CancelablePromise<Record<string, any>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/users/{user_id}/{model_name}/list',
      path: {
        'model_name': modelName,
        'user_id': userId,
      },
      query: {
        'search': search,
      },
    });
  }
  /**
   * @param modelName
   * @param userId
   * @returns any No response body
   * @throws ApiError
   */
  public apiUsersStatsRetrieve(
    modelName: string,
    userId: number,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/users/{user_id}/{model_name}/stats',
      path: {
        'model_name': modelName,
        'user_id': userId,
      },
    });
  }
  /**
   * @param limit Number of results to return per page.
   * @param offset The initial index from which to return the results.
   * @returns PaginatedSchemaVersionList
   * @throws ApiError
   */
  public apiWorksheetsList(
    limit?: number,
    offset?: number,
  ): CancelablePromise<PaginatedSchemaVersionList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/worksheets',
      query: {
        'limit': limit,
        'offset': offset,
      },
    });
  }
  /**
   * @param requestBody
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsCreate(
    requestBody: SchemaVersionRequest,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/worksheets',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsRetrieve(
    id: number,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/worksheets/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @param requestBody
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsUpdate(
    id: number,
    requestBody: SchemaVersionRequest,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/worksheets/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @param requestBody
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsPartialUpdate(
    id: number,
    requestBody?: PatchedSchemaVersionRequest,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/worksheets/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @returns void
   * @throws ApiError
   */
  public apiWorksheetsDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/worksheets/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * Delete a specific version of a schema.
   * Only the author can delete their versions.
   * @param id A unique integer value identifying this Schema Version.
   * @returns void
   * @throws ApiError
   */
  public apiWorksheetsDeleteVersionDestroy(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/worksheets/{id}/delete-version',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsDownloadRetrieve(
    id: number,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/worksheets/{id}/download',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @param id A unique integer value identifying this Schema Version.
   * @param requestBody
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsEnhanceCreate(
    id: number,
    requestBody: SchemaVersionRequest,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/worksheets/{id}/enhance',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Toggle between streaming and non-streaming responses based on query param `stream=true`.
   * @param requestBody
   * @returns SchemaVersion
   * @throws ApiError
   */
  public apiWorksheetsGenerateCreate(
    requestBody: SchemaVersionRequest,
  ): CancelablePromise<SchemaVersion> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/worksheets/generate',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
