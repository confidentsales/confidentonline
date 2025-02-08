const tf = require('@tensorflow/tfjs-node');

async function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Dummy data
  
  const xs = tf.tensor2d([1, 2, 3, 4, 5], [5, 1]);
  const ys = tf.tensor2d([1, 2, 3, 4, 5], [5, 1]);

  await model.fit(xs, ys, { epochs: 10 });
  return model;
}

async function predict(model, value) {
  const prediction = model.predict(tf.tensor2d([value], [1, 1]));
  return prediction.dataSync()[0];
}

(async () => {
  const model = await createModel();
  const prediction = await predict(model, 6);
  console.log('Prediction for 6:', prediction);
})();
