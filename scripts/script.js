const url = "https://economia.awesomeapi.com.br/json/last/USD-BRL"

const formRef = document.querySelector("form");

const copyRef = document.getElementById("copyBtn");
const messageRef = document.getElementById("messageText");
const resultRef = document.getElementById("messageResult");
const toastRef = document.querySelector(".toast");

const salesTaxPercentage = 0.08;
const stockProcFeePercentage = 0.045;
const stockShippingUSD = 14.95;
const redirectShippingUSD = 50;

let priceUSD;

async function getUSD(){
    const response = await fetch(url)
    const data = await response.json()
    const dolar = parseFloat(data.USDBRL.ask);

    priceUSD = dolar;
}


formRef.addEventListener("submit", (event) => {
    event.preventDefault();

    const { clientName, modelSneaker, sizeSneaker, 
        marginProfitInput, droperPriceInput, shippingInput, stockPriceInput } 
        = formRef.elements
    
    const nomeCliente = clientName.value;
    const sneakerModel = modelSneaker.value;
    const sneakerSize = sizeSneaker.value;
    const shipping = parseFloat(shippingInput.value);
    const marginProfit = parseFloat(marginProfitInput.value);

    // Calculos StockX
    const stockPrice = parseFloat(stockPriceInput.value)
    
    const salesTax = stockPrice * salesTaxPercentage;
    const procFee = stockPrice * stockProcFeePercentage;

    const usStockPrice = stockPrice + salesTax + procFee + redirectShippingUSD + stockShippingUSD
    const brStockPrice = usStockPrice * priceUSD;

    const brStockPriceShipping = brStockPrice + shipping
    const finalStockPrice = (brStockPriceShipping * (marginProfit/100)) + brStockPriceShipping

    const finalStockPriceParcelado = (finalStockPrice * 0.2) + finalStockPrice

    // Calculos Droper
    const droperPrice = parseFloat(droperPriceInput.value);

    const droperPriceShipping = droperPrice + shipping
    const pixDroperPrice = droperPriceShipping + (droperPriceShipping * marginProfit/100)
    const parceladoDroperPrice = pixDroperPrice + (pixDroperPrice * 0.2)

    // Mostra lucro, valor pago total
    const totalDroperRef = document.getElementById("totalDroper");
    const lucroDroperRef = document.getElementById("lucroDroper");

    const totalStockRef = document.getElementById("totalStock");
    const lucroStockRef = document.getElementById("lucroStock");

    const lucroDroper = (pixDroperPrice - droperPriceShipping).toFixed(2)
    const lucroStock = (finalStockPrice - brStockPriceShipping).toFixed(2)

    totalDroperRef.innerHTML = "Valor Total: <strong>R$" + droperPriceShipping.toFixed(2)
    lucroDroperRef.innerHTML = "Lucro: <strong style='color: green'>R$ " + lucroDroper

    totalStockRef.innerHTML = "Valor Total: <strong>R$" + brStockPriceShipping.toFixed(2)
    lucroStockRef.innerHTML = "Lucro: <strong style='color: green'>R$" + lucroStock

    // Gera a mensagem para copiar
    messageRef.innerHTML = nomeCliente + ", segue a cotação para encomendar " + sneakerModel + " tamanho " + sneakerSize 
    + "<br><br>TRAZENDO DE FORA<br><br>PIX: R$" + roundNum(finalStockPrice) 
    + "<br>Parcelado: R$" + roundNum(finalStockPriceParcelado) +
    "<br><br>BRASIL<br><br>PIX: R$" + roundNum(pixDroperPrice) + "<br>Parcelado: R$" + roundNum(parceladoDroperPrice)
        
})

copyRef.addEventListener("click", () => {
    let copyM = messageRef.innerHTML.replaceAll("<br>", "\n")

    navigator.clipboard.writeText(copyM)
    toast("Topate")
})

function toast(message){
    toastRef.textContent = message;

    toastRef.style.opacity = 1
    toastRef.style.visibility = 'visible'
    setTimeout(() => {
        toastRef.style.opacity = 0
        setTimeout(() => {
            toastRef.style.visibility = 'hidden'
            toastRef.textContent = ""
        }, 500)
    }, 1000) 
}

function roundNum(x) {
    x.toFixed(1)
    return Math.round(x / 10) * 10;
  }

getUSD()