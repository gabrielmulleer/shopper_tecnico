import Validate from '../../utils/Validacoes';
import { useState } from 'react';
import styles from './Card.module.scss';

export default function Card({ data, updateData }) {
  const [newPrice, setNewPrice] = useState(data.newPrice);
  const [isValid, setIsValid] = useState(true); // Inicialmente, consideramos que o valor é válido
  const handleOnChange = (e) => {
    const updatedPrice = e.target.value.replace(',', '.');
    setNewPrice(updatedPrice);

    const isValidData = Validate({
      ...data,
      newPrice: updatedPrice === '' ? 0 : parseFloat(updatedPrice),
    });

    setIsValid(isValidData === true);
    // Atualize o componente pai com os novos dados, incluindo isValid
    const newData = {
      ...data,
      newPrice: updatedPrice === '' ? 0 : parseFloat(updatedPrice),
      isValid: isValidData === true,
    };

    // Chame a função para atualizar os dados no componente pai
    updateData((prevData) =>
      prevData.map((item) =>
        item.productCode === data.productCode ? newData : item
      )
    );


  };

  const newData = {
    ...data,
    newPrice: newPrice === '' ? 0 : parseFloat(newPrice),
    isValid: isValid, // Agora, isValid reflete o resultado da validação
  };


  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapper__product}>
        <span>Código</span>
        <input
          type='text'
          name='code'
          id=''
          placeholder='Código do produto'
          disabled={true}
          value={data.productCode}
        />
      </div>
      <div className={styles.wrapper__product}>
        <span>Produto</span>
        <input
          type='text'
          name='product'
          id=''
          placeholder='Nome do produto'
          disabled={true}
          value={data.name}
        />
      </div>
      <div className={styles.wrapper__product}>
        <span>Preço de custo</span>
        <input
          type='text'
          name='costPrice'
          id=''
          placeholder='Preço de custo'
          disabled={true}
          value={data.costPrice}
        />
      </div>
      <div className={styles.wrapper__product}>
        <span>Preço atual</span>
        <input
          type='text'
          name='currentPrice'
          id=''
          placeholder='Valor atual'
          disabled={true}
          value={data.currentPrice}
        />
      </div>
      <div className={styles.wrapper__product}>
        <span>Novo preço</span>
        <input
          className={
            (typeof Validate(newData) === 'boolean' ? true : false)
              ? styles.wrapper__valid
              : styles.wrapper__invalid
          }
          type='text'
          name='newPrice'
          id=''
          placeholder='Valor atualizado'
          value={newPrice}
          onChange={handleOnChange}
        />
      </div>

      {Validate(newData) && (
        <p className={styles.errorMsg}>{Validate(newData)}</p>
      )}
    </div>
  );
}
