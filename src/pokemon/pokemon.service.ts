import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto, CreatePokemonDto } from './dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const new_pokemon = await this.pokemonModel.create(createPokemonDto);
      return new_pokemon;
    } catch (error) {
      this.handleExeption(error);
    }
  }

  async findAll() {
    return this.pokemonModel.find().exec();
  }

  async findOne(term: string) {
    const isNumeric = !isNaN(+term);
    const query = isNumeric ? { no: term } : { name: term.toLowerCase().trim() };

    const pokemon = await this.pokemonModel.findOne(query);

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with term ${term} not found`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExeption(error);

    }
  }

  async remove(term: string) {
    const pokemon = await this.pokemonModel.findById(term).exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${term} not found`);
    }
    await pokemon.deleteOne();
    return { ...pokemon.toJSON(), deleted: true };
  }

  private handleExeption(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    if (error.status === 404) {
      throw new NotFoundException(error.response.message);
    }
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
