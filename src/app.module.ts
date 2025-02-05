import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthenticationModule } from './authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ //facilite l'utilisation des variables d'environnement
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.graphql', // Sauvegarde le schéma dans un fichier
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    AuthenticationModule,
  ],
})
export class AppModule {}