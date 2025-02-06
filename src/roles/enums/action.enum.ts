import { registerEnumType } from "@nestjs/graphql";

export enum Action {
    read = 'read',
    create = 'create',
    update = 'update',
    delete = 'delete',
  }

  registerEnumType(Action, {
    name: 'Action', // Nom qui sera utilisé dans le schéma GraphQL
    description: 'Type de permission', // Optionnel, mais utile pour la documentation
  });