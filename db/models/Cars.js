mongoose = global.mongoose;

var Cars = new mongoose.model('Cars', {
  _id: {type: Number}, // This is the accountId
  serializedData: {type: Buffer},
});

module.exports = Cars;