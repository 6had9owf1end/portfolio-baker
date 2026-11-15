import mongoose from 'mongoose';
 
const cakeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Поле title є обов’язковим'],
      trim: true,
      minlength: [2, 'Поле title має містити щонайменше 2 символи'],
      maxlength: [100, 'Поле title має містити не більше 100 символів'],
    },
    flavor: {
      type: String,
      required: [true, 'Поле flavor є обов’язковим'],
      trim: true,
      minlength: [2, 'Поле flavor має містити щонайменше 2 символи'],
      maxlength: [100, 'Поле flavor має містити не більше 100 символів'],
    },
    price: {
      type: Number,
      required: [true, 'Поле price є обов’язковим'],
      min: [1, 'Ціна має бути не меншою за 1'],
      max: [10000, 'Ціна має бути не більшою за 10000'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
 
export default mongoose.model('Cake', cakeSchema);