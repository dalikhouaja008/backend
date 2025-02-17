import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Land, LandDocument } from './schema/land.schema';
import { CreateLandInput } from './dto/create-land.input';

@Injectable()
export class LandService {
  constructor(@InjectModel(Land.name) private landModel: Model<LandDocument>) {}

  async create(createLandInput: CreateLandInput, ownerId: Types.ObjectId): Promise<Land> {
    const newLand = new this.landModel({
      ...createLandInput,
      owner: ownerId,  // Store the user's ObjectId as owner
    });
    return newLand.save();
  }
  

  async findAll(): Promise<Land[]> {
    return this.landModel.find().populate('owner').exec(); // Populate owner details
  }
  
  async findOne(id: string): Promise<Land> {
    const land = await this.landModel.findById(id).populate('owner').exec(); // Populate owner
    if (!land) throw new NotFoundException(`Land with ID ${id} not found`);
    return land;
  }
}
