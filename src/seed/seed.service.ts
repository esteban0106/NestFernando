import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/pokeapi.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}); // Elimina todos los registros de la colección

    const data = await this.http.get<PokeResponse>('/pokemon?limit=15')

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found');
    }

    const pokeData = await Promise.all(
      data.results.map(async pokemon => {
        const parts = pokemon.url.split('/');
        const id = parts[parts.length - 2]; // devuelve the ID from the URL
        const pokemonData = {
          name: pokemon.name,
          no: +id
        }
        await this.pokemonModel.create(pokemonData);

        return pokemonData
      })
    )

    return pokeData
  }
}