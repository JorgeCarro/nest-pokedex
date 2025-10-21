import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;


  async executeSeed() {

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    data.results.forEach( ( {name, url} ) => {
      
      const segments = url.split('/');

      // con estas sentecias sabemos la posición donde se encuentea el no del pokemon
      //console.log(segments);
      //[ 'https:', '', 'pokeapi.co', 'api', 'v2', 'pokemon', '1', '' ]

      //con el + lo transformamos a number y luego cogemos el penúltimo segmento donde está el no
      const no = +segments[ segments.length - 2 ];

      console.log({name, no});

    })
    return data.results;
  }

  
}
