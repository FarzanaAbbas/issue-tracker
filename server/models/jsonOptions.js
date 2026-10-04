// Shared schema options: timestamps, expose `id` instead of `_id`, hide internal fields.
export const jsonOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.password;
      return ret;
    },
  },
};
