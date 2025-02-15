import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Land, LandStatus, LandType } from './schema/land.schema';
import { CreateLandInput } from './dto/create-land.input';
import { UpdateLandInput } from './dto/update-land.input';

@Injectable()
export class LandService {
  constructor(
    @InjectModel(Land.name) private readonly landModel: Model<Land>,
  ) {}

  async create(
    createLandInput: CreateLandInput,
    userId: string,
  ): Promise<Land> {
    const created = new this.landModel({
      ...createLandInput,
      owner: userId,
      status: LandStatus.PENDING,
    });
    return created.save();
  }

  async findAll(filters?: {
    type?: LandType;
    status?: LandStatus;
    location?: string;
    price?: { min?: number; max?: number };
    title?: string;
  }): Promise<Land[]> {
    const query: any = {};

    if (filters) {
      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.location) {
        query.location = { $regex: new RegExp(filters.location, 'i') };
      }

      if (filters.title) {
        query.title = { $regex: new RegExp(filters.title, 'i') };
      }

      if (filters.price) {
        query.price = {};
        if (filters.price.min !== undefined) {
          query.price.$gte = filters.price.min;
        }
        if (filters.price.max !== undefined) {
          query.price.$lte = filters.price.max;
        }
      }
    }

    return this.landModel
      .find(query)
      .populate('owner')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Land> {
    const land = await this.landModel.findById(id).populate('owner').exec();
    if (!land) {
      throw new NotFoundException(`Land #${id} not found`);
    }
    return land;
  }

  async findByOwner(ownerId: string): Promise<Land[]> {
    return this.landModel.find({ owner: ownerId }).populate('owner').exec();
  }

  async update(id: string, updateLandInput: UpdateLandInput): Promise<Land> {
    const updated = await this.landModel
      .findByIdAndUpdate(id, updateLandInput, { new: true })
      .populate('owner')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Land #${id} not found`);
    }
    return updated;
  }

  async updateStatus(id: string, status: LandStatus): Promise<Land> {
    const updated = await this.landModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('owner')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Land #${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<Land> {
    const deleted = await this.landModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Land #${id} not found`);
    }
    return deleted;
  }
}
