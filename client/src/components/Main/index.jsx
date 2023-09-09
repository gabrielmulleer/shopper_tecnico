import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../Card';
import styles from './Main.module.scss';
import PackCard from '../PackCard';
import Validate from '../../utils/Validacoes';

function CsvUploader() {
  const [csvFile, setCsvFile] = useState(null);
  const [dados, setDados] = useState([]);
  const [dadosAtualizados, setDadosAtualizados] = useState([]);
  const [verificaBotao, setVerificaBotao] = useState(true);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };
  const processCSVData = async (csvData) => {
    // Crie um novo array de objetos com a chave 'isValid' após a validação
    const processedData = await Promise.all(
      csvData.map(async (item) => {
        // Valide o item usando a função Validate
        const isValid = typeof Validate(item) === 'boolean';

        // Crie um novo objeto com a chave 'isValid'
        return { ...item, isValid };
      })
    );

    return processedData;
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
        'http://localhost:3000/products/readCsv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Chame a função processCSVData para validar os dados
      const validatedData = await processCSVData(response.data);

      setDados(validatedData);
      setDadosAtualizados(validatedData);
    } catch (error) {
      console.error('Erro ao enviar o arquivo CSV:', error);
    }
  };
  const updateData = (updatedData) => {
    setDadosAtualizados(updatedData);
  };
  const areAllObjectsValid = (data) => {
    return data.every((item) => item.isValid === true);
  };
  const handleUpdateProducts = async () => {
    try {
      // Faça a solicitação POST para a rota apropriada no servidor
      const response = await axios.post(
        'http://localhost:3000/products/update-products',
        dadosAtualizados
      );

      // Lide com a resposta do servidor, se necessário
      console.log('Resposta do servidor:', response.data);

      // Atualize o estado ou faça qualquer outra coisa com a resposta, se necessário
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      // Lide com erros de solicitação, se necessário
    }
  };
  console.log(dados);
  useEffect(() => {
    // Esta parte é importante para atualizar verificaBotao quando os dados são carregados
    setVerificaBotao(areAllObjectsValid(dadosAtualizados));
  }, [dadosAtualizados]);
  return (
    <div className={styles.wrapper}>
      <h2>Upload de Arquivo CSV</h2>
      <form onSubmit={handleSubmit}>
        <input type='file' accept='.csv' onChange={handleFileChange} />
        <button type='submit'>Enviar CSV</button>
      </form>

      <div className={styles.card}>
        {dados.map((element) => (
          <div key={element.productCode} className={styles.card__content}>
            {element.isPack && element.isPack.length > 0 ? (
              <>
                <h2>Kit</h2>
                <Card
                  key={element.productCode}
                  data={element}
                  updateData={updateData}
                />

                <span>Componente do kit: </span>
                {element.isPack.map((elementPack) => (
                  <PackCard
                    key={elementPack.productCode}
                    dataPack={elementPack}
                  />
                ))}
              </>
            ) : (
              <Card
                key={element.productCode}
                data={element}
                updateData={updateData}
              />
            )}
          </div>
        ))}
      </div>
      {dadosAtualizados.length > 0 && (
        <button
          type='submit'
          disabled={!verificaBotao}
          onClick={handleUpdateProducts}
        >
          Atualizar Produtos
        </button>
      )}
    </div>
  );
}

export default CsvUploader;
