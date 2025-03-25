import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
   constructor (private readonly dataSourse:DataSource){}

   async getConnnection(){
    return this.dataSourse;
   }
}
