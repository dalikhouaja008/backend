import { registerEnumType } from '@nestjs/graphql';

export enum Resource {
  settings = 'settings',
  products = 'products',
  users = 'users',
}
registerEnumType(Resource, {
  name: 'Resource', // Nom qui sera utilisé dans le schéma GraphQL
  description: 'Type de ressource disponible', // Optionnel, mais utile pour la documentation
});
