import  { Schema, Mongoose} from "mongoose"

const mongoose = new Mongoose();

mongoose.connect("mongodb+srv://sukeshp:x21qkXQYjY5XbopS@cluster0-lxsof.mongodb.net/montra?retryWrites=true");

const schema: Schema = new Schema({
  _id: String,
  grantAgeWise: {type: Boolean, required: true},
  grantUpload: {type: Boolean, required: true},
  grantEdit: {type: Boolean, required: true},
  grantSale: {type: Boolean, required: true},
  userName: {type: String, required: true},
  code: {type: String, required: true},
  signed: {type: Boolean, required: true},
});

export default mongoose.model('StockUser', schema);