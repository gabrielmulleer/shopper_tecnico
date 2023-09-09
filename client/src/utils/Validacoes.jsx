export default function Validate(data) {
  // Função para validar o preço

  function validatePrice(currentPrice, newPrice, costPrice) {
    return (
      newPrice >= costPrice &&
      Math.abs(newPrice - currentPrice) <= currentPrice * 0.1
    );
  }

  const isValidPrice = validatePrice(
    data.currentPrice,
    data.newPrice,
    data.costPrice
  );
  // Função para obter a razão do preço inválido
  function getInvalidPriceReason(currentPrice, newPrice, costPrice) {
    if (parseFloat(newPrice) < parseFloat(costPrice)) {
      return `* O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}).`;
    }
    if (
      parseFloat(newPrice) >=
      parseFloat(currentPrice) + parseFloat(currentPrice * 0.1)
    ) {
      return `* O reajuste de preço (${newPrice}) é maior que 10% do preço atual (${currentPrice}).`;
    } else if (
      parseFloat(newPrice) <=
      parseFloat(currentPrice) - parseFloat(currentPrice * 0.1)
    ) {
      return `* O reajuste de preço (${newPrice}) é menor que 10% do preço atual (${currentPrice}).`;
    }
  }
  const errorMsg = getInvalidPriceReason(
    data.currentPrice,
    data.newPrice,
    data.costPrice
  );
  if (isValidPrice) {
    return isValidPrice;
  } else {
    return errorMsg;
  }
}
