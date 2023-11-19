import  { Schema, Mongoose} from "mongoose"

const mongoose = new Mongoose();

mongoose.connect("mongodb+srv://sukeshp:x21qkXQYjY5XbopS@cluster0-lxsof.mongodb.net/montra?retryWrites=true");

type IUnit = {
  _id: string,
  engineNo: string,
  model: string,
  color: string,
  entryDate: Date,
  saleDate?: Date,
  saleType: 'Counter' | 'Network',
  transactionType: 'Cash' | 'Finance',
  checkpoint?: string,
  financeName?: string
}

const unitSchema = new Schema<IUnit>({
  _id: String,
  engineNo: {type: String, required: true},
  model: {type: String, required: true},
  color: {type: String, required: true},
  entryDate: {type: Date, required: true},
  saleDate: {type: Date},
  saleType: {type: String, enum: ["Counter", "Network"]},
  transactionType: {typr: String, enum: ["Cash", "Finance"]},
  checkpoint: {type: String, required: function () { return this.saleType === "Network"}},
  financeName: {type: String, required: function () { return ('soldType' in this) && this.saleType === "Counter" && this.transactionType == "Finance"}},
});

unitSchema.pre('save', function (next) {
  // capitalize
  if (this.financeName) {
    this.financeName = this.financeName.toUpperCase();
  }
  next();
});

export default mongoose.model('Unit', unitSchema);

