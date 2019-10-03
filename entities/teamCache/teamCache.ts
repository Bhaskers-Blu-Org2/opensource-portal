//
// Copyright (c) Microsoft.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

'use strict';

import { EntityField} from '../../lib/entityMetadataProvider/entityMetadataProvider';
import { EntityMetadataType, IEntityMetadata } from '../../lib/entityMetadataProvider/entityMetadata';
import { IEntityMetadataFixedQuery, FixedQueryType } from '../../lib/entityMetadataProvider/query';
import { EntityMetadataMappings, MetadataMappingDefinition } from '../../lib/entityMetadataProvider/declarations';
import { TeamCacheFixedQueryByOrganizationId } from '.';
import { PostgresJsonEntityQuery, PostgresGetAllEntities } from '../../lib/entityMetadataProvider/postgres';
import { stringOrNumberAsString } from '../../utils';

const type = EntityMetadataType.TeamCache;

interface ITeamCacheProperties {
  organizationId: any;
  teamName: any;
  teamSlug: any;
  teamDescription: any;
  teamDetails: any;
  cacheUpdated: any;
}

const teamId = 'teamId';

const Field: ITeamCacheProperties = {
  organizationId: 'organizationId',
  teamName: 'teamName',
  teamSlug: 'teamSlug',
  teamDescription: 'teamDescription',
  teamDetails: 'teamDetails',
  cacheUpdated: 'cacheUpdated',
}

const fieldNames = Object.getOwnPropertyNames(Field);

export class TeamCacheEntity implements ITeamCacheProperties {
  teamId: string;
  teamName: string;
  teamSlug: string;
  teamDescription: string;
  organizationId: string;
  teamDetails: any;
  cacheUpdated: Date;

  constructor() {
    this.cacheUpdated = new Date();
  }
}

EntityMetadataMappings.Register(type, MetadataMappingDefinition.EntityInstantiate, () => { return new TeamCacheEntity(); });
EntityMetadataMappings.Register(type, MetadataMappingDefinition.EntityIdColumnName, teamId);

EntityMetadataMappings.Register(type, MetadataMappingDefinition.MemoryMapping, new Map<string, string>([
  [Field.organizationId, 'orgid'],
  [Field.teamName, 'teamName'],
  [Field.teamSlug, 'teamSlug'],
  [Field.teamDescription, 'teamDescription'],
  [Field.teamDetails, 'teamDetails'],
  [Field.cacheUpdated, 'cached'],
]));
EntityMetadataMappings.RuntimeValidateMappings(type, MetadataMappingDefinition.MemoryMapping, fieldNames, [teamId]);

EntityMetadataMappings.Register(type, MetadataMappingDefinition.PostgresDefaultTableName, 'teamcache');
EntityMetadataMappings.Register(type, MetadataMappingDefinition.PostgresDefaultTypeColumnName, 'teamcache');
EntityMetadataMappings.Register(type, MetadataMappingDefinition.PostgresMapping, new Map<string, string>([
  [Field.organizationId, (Field.organizationId as string).toLowerCase()], // net new
  [Field.teamName, (Field.teamName as string).toLowerCase()],
  [Field.teamSlug, (Field.teamSlug as string).toLowerCase()],
  [Field.teamDescription, (Field.teamDescription as string).toLowerCase()],
  [Field.teamDetails, (Field.teamDetails as string).toLowerCase()],
  [Field.cacheUpdated, (Field.cacheUpdated as string).toLowerCase()],
]));
EntityMetadataMappings.RuntimeValidateMappings(type, MetadataMappingDefinition.PostgresMapping, fieldNames, [teamId]);

EntityMetadataMappings.Register(type, MetadataMappingDefinition.PostgresQueries, (query: IEntityMetadataFixedQuery, mapMetadataPropertiesToFields: string[], metadataColumnName: string, tableName: string, getEntityTypeColumnValue) => {
  const entityTypeColumn = mapMetadataPropertiesToFields[EntityField.Type];
  const entityTypeValue = getEntityTypeColumnValue(type);
  switch (query.fixedQueryType) {
    case FixedQueryType.TeamCacheGetAll: {
      return PostgresGetAllEntities(tableName, entityTypeColumn, entityTypeValue);
    }
    case FixedQueryType.TeamCacheGetByOrganizationId: {
      const { organizationId } = query as TeamCacheFixedQueryByOrganizationId;
      if (!organizationId) {
        throw new Error('organizationId required');
      }
      return PostgresJsonEntityQuery(tableName, entityTypeColumn, entityTypeValue, metadataColumnName, {
        organizationid: stringOrNumberAsString(organizationId),
      });
    }
    default:
      throw new Error(`The fixed query type "${query.fixedQueryType}" is not implemented by this provider for repository for the type ${type}, or is of an unknown type`);
  }
});

EntityMetadataMappings.Register(type, MetadataMappingDefinition.MemoryQueries, (query: IEntityMetadataFixedQuery, allInTypeBin: IEntityMetadata[]) => {
  switch (query.fixedQueryType) {
    case FixedQueryType.TeamCacheGetAll:
      return allInTypeBin;
    case FixedQueryType.TeamCacheGetByOrganizationId:
      const { organizationId } = query as TeamCacheFixedQueryByOrganizationId;
      if (!organizationId) {
        throw new Error('organizationId required');
      }
      throw new Error('Not implemented yet');
    default:
      throw new Error(`The fixed query type "${query.fixedQueryType}" is not implemented by this provider for the type ${type}, or is of an unknown type`);
  }
});

// Runtime validation of FieldNames
for (let i = 0; i < fieldNames.length; i++) {
  const fn = fieldNames[i];
  if (Field[fn] !== fn) {
    throw new Error(`Field name ${fn} and value do not match in ${__filename}`);
  }
}

export const EntityImplementation = {
  Type: type,
  EnsureDefinitions: () => {},
};
