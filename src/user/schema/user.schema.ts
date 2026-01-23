import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';

@Schema()
export class User {
  @Prop({
    type: SchemaTypes.ObjectId,
    auto: true,
  })
  _id: Types.ObjectId;

  @Prop({
    unique: true,
    required: true,
  })
  email: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({
    required: true,
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
