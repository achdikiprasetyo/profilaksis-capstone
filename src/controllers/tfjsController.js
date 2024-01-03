const tf = require('@tensorflow/tfjs');
const db = require('../database/db');
const { verifyToken } = require('../utils/jwt');

// Load the TensorFlow.js model
const loadModelHeart = async () => {
  const model = await tf.loadLayersModel(`https://profilaksis-llgpy7csea-as.a.run.app/heart/model.json`);
  // const model = await tf.loadLayersModel(`http://localhost:3000/heart/model.json`);
  return model;
};


// Function to save prediction results to the history table
async function savePredictionToHistory(username, prediction) {
  try {
    let healthStatus = '';
    let description = '';

    const roundedPrediction = Math.round(prediction);

    if (roundedPrediction <= 30) {
      healthStatus = 'Healthy';
      description = 'Lanjutkan! Jantung Anda sehat. Pertahankan pola makan sehat dan aktivitas fisik teratur.';
    } else if (roundedPrediction <= 70) {
      healthStatus = 'Average';
      description = 'Kesehatan jantung Anda rata-rata. Pertimbangkan untuk mengadopsi pilihan gaya hidup lebih sehat, seperti meningkatkan pola makan dan aktivitas fisik.';
    } else {
      healthStatus = 'Unhealthy';
      description = 'Konsultasi dianjurkan. Anda mungkin berisiko lebih tinggi terkena penyakit jantung. Disarankan untuk menghindari merokok, mengurangi konsumsi alkohol, dan berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.';
    }

    const kategoriPenyakit = 'Diabetes';

    const insertQuery = 'INSERT INTO health_history (username, prediction_result, health_status, kategori_penyakit, keterangan) VALUES (?, ?, ?, ?, ?)';
    const insertValues = [username, prediction, healthStatus, kategoriPenyakit, description];

    db.query(insertQuery, insertValues, (error, result) => {
      if (error) {
        console.error('Error saving prediction to history:', error);
      } else {
        console.log('Prediction saved to history:', result);
      }
    });
  } catch (error) {
    console.error('Error saving prediction to history:', error);
  }
}


const predictHeartDisease = async (req, res) => {
  try {
    const {
      kelamin,
      umur,
      bmi,
      tekananDarah,
      kolesterol,
      stroke,
      diabetes,
      rokok,
      alkohol,
      olahraga,
      buah,
      sayur,
      susahJalan
    } = req.body;

    // Ensure all required input variables are provided
    if (
      kelamin === undefined || umur === undefined || bmi === undefined || tekananDarah === undefined || rokok === undefined ||
      diabetes === undefined || stroke === undefined || alkohol === undefined ||  kolesterol === undefined ||
      susahJalan === undefined || olahraga === undefined || buah === undefined || sayur === undefined
    ) {
      return res.status(400).json({ error: 'All input variables are required' });
    }

    // Load TensorFlow.js model
    const model = await loadModelHeart();

    // Make predictions
    const input = tf.tensor2d([[kelamin, umur, bmi, tekananDarah, kolesterol, stroke, diabetes, rokok, alkohol, olahraga, buah, sayur, susahJalan]]);
    const prediction = model.predict(input).dataSync()[0];
    const roundedPrediction = Math.round(prediction * 100);

    let healthStatus, keterangan;
    
    if (roundedPrediction <= 30) {
      healthStatus = 'Healthy';
      keterangan = 'Selamat! Jantung Anda sehat. Pertahankan pola makan sehat dan aktivitas fisik teratur.';
    } else if (roundedPrediction <= 70) {
      healthStatus = 'Average';
      keterangan = 'Kesehatan jantung Anda rata-rata. Pertimbangkan untuk mengadopsi pilihan gaya hidup lebih sehat, seperti meningkatkan pola makan dan aktivitas fisik.';
    } else {
      healthStatus = 'Unhealthy';
      keterangan = 'Konsultasi dianjurkan. Anda mungkin berisiko lebih tinggi terkena penyakit jantung. Disarankan untuk menghindari merokok, mengurangi konsumsi alkohol, dan berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.';
    }

    // Save prediction results to the history table
    const token = req.header('Authorization');
    const decodedToken = verifyToken(token);
    const { username } = decodedToken;

    await savePredictionToHistory(username, roundedPrediction);
    res.json({
      message: 'Heart disease prediction saved successfully',
      data: { 
      prediction: roundedPrediction, 
      healthStatus: healthStatus,
      keterangan: keterangan,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const loadModelDiabetes = async () => {
  const model = await tf.loadLayersModel(`https://profilaksis-llgpy7csea-as.a.run.app/diabetes/model.json`);
  // const model = await tf.loadLayersModel(`http://localhost:3000/diabetes/model.json`);
  return model;
};

async function savePredictionDiabetesToHistory(username, prediction) {
  try {
    let healthStatus = '';
    let keterangan = '';

    const roundedPrediction = Math.round(prediction);

    if (roundedPrediction <= 30) {
      healthStatus = 'Healthy';
      keterangan = 'Selamat! Anda tidak memiliki diabetes. Pertahankan pola makan sehat dan aktivitas fisik teratur.';
    } else if (roundedPrediction <= 70) {
      healthStatus = 'Average';
      keterangan = 'Risiko diabetes Anda rata-rata. Pertimbangkan untuk mengontrol asupan gula, menjaga berat badan, dan mengadopsi gaya hidup lebih sehat.';
    } else {
      healthStatus = 'Unhealthy';
      keterangan = 'Konsultasi disarankan. Anda mungkin berisiko tinggi terkena diabetes. Disarankan untuk mengontrol asupan gula, menjaga berat badan, dan berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.';
    }

    const kategoriPenyakit = 'Diabetes';

    const insertQuery = 'INSERT INTO health_history (username, prediction_result, health_status, kategori_penyakit, keterangan) VALUES (?, ?, ?, ?, ?)';
    const insertValues = [username, prediction, healthStatus, kategoriPenyakit, keterangan];

    db.query(insertQuery, insertValues, (error, result) => {
      if (error) {
        console.error('Error saving diabetes prediction to history:', error);
      } else {
        console.log('Diabetes prediction saved to history:', result);
      }
    });
  } catch (error) {
    console.error('Error saving diabetes prediction to history:', error);
  }
}


const predictDiabetesDisease = async (req, res) => {
  try {
    const {
      kelamin,
      umur,
      bmi,
      tekananDarah,
      kolesterol,
      stroke,
      sakitJantung,
      rokok,
      alkohol,
      olahraga,
      buah,
      sayur,
      susahJalan
    } = req.body;

    // Ensure all required input variables are provided
    if (
      kelamin === undefined || umur === undefined || bmi === undefined || tekananDarah === undefined || rokok === undefined ||
      sakitJantung === undefined || stroke === undefined || alkohol === undefined ||  kolesterol === undefined ||
      susahJalan === undefined || olahraga === undefined || buah === undefined || sayur === undefined
    ) {
      return res.status(400).json({ error: 'All input variables are required' });
    }

    // Load TensorFlow.js model
    const model = await loadModelDiabetes();

    // Make predictions
    const input = tf.tensor2d([[kelamin, umur, bmi, tekananDarah, kolesterol, stroke, sakitJantung, rokok, alkohol, olahraga, buah, sayur, susahJalan]]);
    const prediction = model.predict(input).dataSync()[0];
    const roundedPrediction = Math.round(prediction * 100);

    let healthStatus, keterangan;
    
    if (roundedPrediction <= 30) {
      healthStatus = 'Healthy';
      keterangan = 'Selamat! Anda tidak memiliki diabetes. Pertahankan pola makan sehat dan aktivitas fisik teratur.';
    } else if (roundedPrediction <= 70) {
      healthStatus = 'Average';
      keterangan = 'Risiko diabetes Anda rata-rata. Pertimbangkan untuk mengontrol asupan gula, menjaga berat badan, dan mengadopsi gaya hidup lebih sehat.';
    } else {
      healthStatus = 'Unhealthy';
      keterangan = 'Konsultasi disarankan. Anda mungkin berisiko tinggi terkena diabetes. Disarankan untuk mengontrol asupan gula, menjaga berat badan, dan berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.';
    }
    // Save diabetes prediction results to the history table
    const token = req.header('Authorization');
    const decodedToken = verifyToken(token);
    const { username } = decodedToken;

    await savePredictionDiabetesToHistory(username, roundedPrediction);
    res.json({
      message: 'Diabetes prediction saved successfully',data:{ 
      prediction: roundedPrediction, 
      healthStatus: healthStatus,
      keterangan: keterangan,
       
    }});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  predictHeartDisease,
  predictDiabetesDisease,
};
