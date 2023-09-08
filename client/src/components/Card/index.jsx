import Validate from '../../utils/Validacoes';
import { useState } from 'react';
export default function Card({ data }) {
  const [newPrice, setNewPrice] = useState(data.newPrice);
  const handleOnChange = (e) => {
    setNewPrice(e.target.value.replace(',', '.'));
  };
  const newData = { ...data, newPrice: newPrice == '' ? 0 : newPrice };

  return (
    <div>
      <input
        type='text'
        name='code'
        id=''
        placeholder='Código do produto'
        disabled={true}
        value={data.product_code}
      />
      <input
        type='text'
        name='product'
        id=''
        placeholder='Nome do produto'
        disabled={true}
        value={data.name}
      />
      <input
        type='text'
        name='costPrice'
        id=''
        placeholder='Preço de custo'
        disabled={true}
        value={data.costPrice}
      />
      <input
        type='text'
        name='currentPrice'
        id=''
        placeholder='Valor atual'
        disabled={true}
        value={data.currentPrice}
      />
      <input
        type='text'
        name='newPrice'
        id=''
        placeholder='Valor atualizado'
        value={newPrice}
        onChange={handleOnChange}
      />
      {Validate(newData) && <p>{Validate(newData)}</p>}
      {data.isPack && (
        <input
          type='checkbox'
          name='isPack'
          id=''
          checked={data.isPack.length > 1}
        />
      )}
    </div>
  );
}
