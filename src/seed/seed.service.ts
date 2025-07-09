import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/pokeapi.interface';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://pokeapi.co/api/v2',
      timeout: 5000,
    });
  }

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('/pokemon?limit=10')

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found');
    }

    const pokeData = data.results.map(pokemon => {
      const parts = pokemon.url.split('/');
      const id = parts[parts.length - 2]; // devuelve the ID from the URL
      return {
        name: pokemon.name,
        no: +id
      }
    })

    return pokeData
  }
}