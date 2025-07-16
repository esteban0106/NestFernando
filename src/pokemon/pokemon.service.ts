import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto, CreatePokemonDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;
  private defaultOffset: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    console.log(process.env.DEFAULT_LIMIT);
    this.defaultLimit = this.configService.get('defaultLimit') as number;
    console.log("🚀 ~ PokemonService ~ defaultLimit:", this.defaultLimit)
    this.defaultOffset = this.configService.get('defaultOffset') as number;
    console.log("🚀 ~ PokemonService ~ defaultOffset:", this.defaultOffset)
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const new_pokemon = await this.pokemonModel.create(createPokemonDto);
      return new_pokemon;
    } catch (error) {
      this.handleExeption(error);
    }
  }

  async findAll({ limit = this.defaultLimit, offset = this.defaultOffset }: PaginationDto = {}) {
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v')
      .exec();
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
