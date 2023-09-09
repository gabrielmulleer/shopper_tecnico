export default function PackCard({ dataPack, newPrice }) {
  return (
    <div>
      <input
        type='text'
        name='code'
        id=''
        placeholder='Código do produto'
        disabled={true}
        value={`Codigo do produto: ${dataPack.productCode}`}
      />
      <input
        type='text'
        name='name'
        id=''
        placeholder='Nome do produto'
        disabled={true}
        value={dataPack.name}
      />
      <input
        type='text'
        name='costPrice'
        id=''
        placeholder='Custo do produto'
        disabled={true}
        value={`Preço de custo: ${dataPack.costPrice}`}
      />
      <input
        type='text'
        name='currentPrice'
        id=''
        placeholder='Valor atual'
        disabled={true}
        value={`Preço atual: ${dataPack.currentPrice}`}
      />

      <input
        type='text'
        name='qty'
        id=''
        placeholder='Quantidade'
        disabled={true}
        value={`Quantidade: ${dataPack.qty}`}
      />
    </div>
  );
}
