import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';



@Injectable()
export class SeedService {

  

  constructor(
      @InjectModel( Pokemon.name )
      private readonly pokemonModel: Model<Pokemon>,
      private readonly http: AxiosAdapter,
    ){}

 


  async executeSeed() {

    const pokemonToInsert: { name: string, no: number }[] = []; 

    // OJOOO !!!!  borramos todos los registros de la tabla
    await this.pokemonModel.deleteMany({}); // delete * from pokemons

    const data  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // para insertar todos a la vez
    const insertPromisesArray = [];



    data.results.forEach(async ( {name, url} ) => {
      
      const segments = url.split('/');

      // con estas sentecias sabemos la posición donde se encuentea el no del pokemon
      //console.log(segments);
      //[ 'https:', '', 'pokeapi.co', 'api', 'v2', 'pokemon', '1', '' ]

      //con el + lo transformamos a number y luego cogemos el penúltimo segmento donde está el no
      const no = +segments[ segments.length - 2 ];

      pokemonToInsert.push({name, no})

      // esto lo inserta uno a uno y puede tener mucho retraso y utiliza async detrás de .forEach
      //const pokemon = await this.pokemonModel.create( {name, no} );

      // con esto vamos guardando las promesas que nos van llegando, dando igual el orden para luego insertar todas.
      /* insertPromisesArray.push(
        this.pokemonModel.create(pokemonToInsert);
      ); */

      //alternativa al codigo que no funcionaba

      

      //console.log({name, no});

    });


    await this.pokemonModel.insertMany(pokemonToInsert);
    //lo hacemos con el codigo de arriba
    //await Promise.all(insertPromisesArray);


    return 'SEED executed';
  }

  
}
