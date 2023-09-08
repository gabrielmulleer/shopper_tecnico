// src/components/CsvUploader.js
import React, { useState } from 'react';
import axios from 'axios';
import Card from '../Card';

function CsvUploader() {
  const data = [
    { product_code: 16, new_price: 23 },
    { product_code: 18, new_price: 20 },
  ];
  const [csvFile, setCsvFile] = useState(null);
  const [dados, setDados] = useState([]);
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      alert('Selecione um arquivo CSV válido.');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await axios.post(
        'http://localhost:3000/products/csv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setDados(response.data);
    } catch (error) {
      console.error('Erro ao enviar o arquivo CSV:', error);
    }
  };

  return (
    <div>
      <h2>Upload de Arquivo CSV</h2>
      <form onSubmit={handleSubmit}>
        <input type='file' accept='.csv' onChange={handleFileChange} />
        <button type='submit'>Enviar CSV</button>
      </form>
      {dados.map((element) => (
        <Card key={element.product_code} data={element} />
      ))}
    </div>
  );
}

export default CsvUploader;
