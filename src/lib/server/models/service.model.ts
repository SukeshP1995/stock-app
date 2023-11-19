import  { Schema, Mongoose} from "mongoose"

const mongoose = new Mongoose();

mongoose.connect("mongodb+srv://sukeshp:x21qkXQYjY5XbopS@cluster0-lxsof.mongodb.net/montra?retryWrites=true");

const serviceSchema: Schema = new Schema({
  _id: Date,
  free: {type: Number},
  paid: {type: Number},
  postWarranty: {type: Number},
  minor: {type: Number},
  accident: {type: Number},
  joyRide: {type: Number},
  PUC: {type: Number},
  goodLife: {type: Number},
  nitrogen: {type: Number},
  spares: {type: Number},
  labour: {type: Number},
  engine: {type: Number},
  engineOilLtr: {type: Number},
  engineOilVehicles: {type: Number},
  pending: {type: Number},
});

export default mongoose.model('Service', serviceSchema);