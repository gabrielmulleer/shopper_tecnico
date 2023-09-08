export default function Validate(data) {
  // Função para validar o preço
  function validatePrice(currentPrice, newPrice, costPrice) {
    return (
      newPrice >= costPrice &&
      Math.abs(newPrice - currentPrice) <= currentPrice * 0.1
    );
  }
  // Função para obter a razão do preço inválido
  function getInvalidPriceReason(currentPrice, newPrice, costPrice) {
    if (newPrice < costPrice) {
      return `O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}).`;
    }
    return `O reajuste de preço (${newPrice}) é ${
      newPrice > currentPrice + currentPrice * 0.1 ? 'maior' : 'menor'
    } que 10% do preço atual (${currentPrice}).`;
  }

  const isValidPrice = validatePrice(
    data.currentPrice,
    data.newPrice,
    data.costPrice
  );

  const errorMsg = getInvalidPriceReason(
    data.currentPrice,
    data.newPrice,
    data.costPrice
  );

  if (!isValidPrice) {
    return errorMsg;
  }
}
