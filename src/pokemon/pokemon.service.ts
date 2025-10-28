import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';





@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService

  ){
    //console.log(process.env.DEFAULT_LIMIT);
    this.defaultLimit = configService.get<number>('defaultLimit');
    //console.log({ defaultLimit });
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;

    } catch (error) {

      this.handleExceptions(error);

    }
    
  }

  findAll( paginationDto: PaginationDto) {

    const {limit = this.defaultLimit, offset = 0} = paginationDto;
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v');
  }

  async findOne(term: string) {
   
    let pokemon: Pokemon | null = null;

    //esto convierte ese id en número .Significa: Si esto es un número
    // búsqueda por id
    if ( !isNaN(+term) ){ 
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //MongoID
    //ponemos esta condición para que si ya existe un pokemon no hace falta evaluarla
    if ( !pokemon && isValidObjectId( term )) {
      pokemon = await this.pokemonModel.findById( term );
    }

    //Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim()})
    }

    if ( !pokemon ) 
      throw new NotFoundException(`Pokemon with id, name or no ${ term } not found`);



    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    
      const pokemon = await this.findOne( term );

      if ( updatePokemonDto.name )
          updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      
      // con las siguientes líneas, daba la respuesta sin actualizar aunque si se cambia en base de datos. 
      //await pokemon.updateOne( updatePokemonDto, { new: true });
      //return pokemon;
    try {
      // con estas 2 senntecias, si no da error se guarda en pokemon. Lo que hacemos es pasarlo a Json y luego sobreescribir otra vez con los datos de updatePokemonDto
      await pokemon.updateOne ( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto}

    } catch (error) {
      
        this.handleExceptions(error);

    }
    
  } 

  async remove(id: string) {
    
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();

    //const result = this.pokemonModel.findByIdAndDelete ( id );
    

    // con esto se consulta y se elimina en una sola consulta por si envian alguna cadena con formato mongoId pero que no esté en la base de datos

    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`)
    return;

  }



  private handleExceptions ( error: any ) {
    if ( error.code === 11000 ){
        throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`)
      }
        console.log(error);
        throw new InternalServerErrorException(`Can't create Pokemon - Check server logs `)

  }
}
