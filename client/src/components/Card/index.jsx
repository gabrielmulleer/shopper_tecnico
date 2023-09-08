export default function Card({ data }) {
  console.log(data);
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
        disabled={true}
        value={data.newPrice}
      />
    </div>
  );
}
