import mongoose from "mongoose";
// An interface that describes the properties
// that a User Document has
export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocMethod extends UserDoc, mongoose.Document {
  getJwtToken: () => string;
}
