const url = "https://economia.awesomeapi.com.br/json/last/USD-BRL"
const wbhook = "https://discord.com/api/webhooks/1100328815143686184/wmZKIoxxPGue_11gGh_lP7z-aCWx-tWP0AfmNmrwNAkdJXuCKjsxwYmYKqFTyD8v4mIz"

const formRef = document.querySelector("form");

const copyRef = document.getElementById("copyBtn");
const messageRef = document.getElementById("messageText");
const messageBoxRef = document.querySelector(".message");
const resultRef = document.getElementById("messageResult");
const toastRef = document.querySelector(".toast");
const stockRef = document.querySelector(".stockInfo");
const goatRef = document.querySelector(".goatInfo");

const salesTaxPercentage = 0.08;
const stockProcFeePercentage = 0.045;
const stockShippingUSD = 14.95;

const taxGoat = 0.075;
const goatShippingUSD = 14.50;

//Conferir IOF
const iofCard = 0.04;

//const redirectShippingUSD = 50;
const usPyShipping = 27.50;
const pyBrShipping = 0.2; //20% do valor da ask
const redirectShippingUSD = (ask) =>{
    return (ask * pyBrShipping) + usPyShipping
}

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
        marginProfitInput, droperPriceInput, shippingInput, stockPriceInput, goatPriceInput } 
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

    const usStockPrice = stockPrice + salesTax + procFee + stockShippingUSD + redirectShippingUSD(stockPrice);
    const brStockPrice = usStockPrice * priceUSD;

    const finalStockPrice = (brStockPrice * (marginProfit/100)) + brStockPrice

    const finalStockPriceParcelado = (finalStockPrice * 0.2) + finalStockPrice

    // Calculos Droper
    const droperPrice = parseFloat(droperPriceInput.value);

    const droperPriceShipping = droperPrice + shipping
    const pixDroperPrice = droperPriceShipping + (droperPriceShipping * marginProfit/100)
    const parceladoDroperPrice = pixDroperPrice + (pixDroperPrice * 0.2)

    // Calculos Goat
    const goatPrice = parseFloat(goatPriceInput.value);

    const goatTax = goatPrice * taxGoat;
    const usGoatPrice = goatPrice + goatTax + goatShippingUSD + redirectShippingUSD(goatPrice);
    const brGoatPrice = usGoatPrice * priceUSD;

    const pixGoatPrice = (brGoatPrice * (marginProfit/100) + brGoatPrice);
    const parceladoGoatPrice = pixGoatPrice + (pixGoatPrice * 0.2);

    // Mostra lucro, valor pago total
    const totalDroperRef = document.getElementById("totalDroper");
    const lucroDroperRef = document.getElementById("lucroDroper");

    const totalStockRef = document.getElementById("totalStock");
    const lucroStockRef = document.getElementById("lucroStock");

    const totalGoatRef = document.getElementById("totalGoat");
    const lucroGoatRef = document.getElementById("lucroGoat");

    const lucroDroper = (pixDroperPrice - droperPriceShipping).toFixed(2)
    const lucroStock = (finalStockPrice - brStockPrice).toFixed(2)
    const lucroGoat = (pixGoatPrice - brGoatPrice).toFixed(2)

    totalDroperRef.innerHTML = "Valor Total: <strong>R$" + droperPriceShipping.toFixed(2)
    lucroDroperRef.innerHTML = "Lucro: <strong style='color: green'>R$ " + lucroDroper

    totalStockRef.innerHTML = "Valor Total: <strong>R$" + brStockPrice.toFixed(2)
    lucroStockRef.innerHTML = "Lucro: <strong style='color: green'>R$" + lucroStock

    totalGoatRef.innerHTML = "Valor Total: <strong>R$" + brGoatPrice.toFixed(2)
    lucroGoatRef.innerHTML = "Lucro: <strong style='color: green'>R$" + lucroGoat

    // Cria msg do webhook
    const orderMsg = createMsg();
    addField(orderMsg, "Cliente:", nomeCliente)
    addField(orderMsg, "Modelo:", sneakerModel)
    addField(orderMsg, "Tamanho:", sneakerSize)
    addField(orderMsg, "Frete(BRL):", shipping)
    addField(orderMsg, "Margem em %:", marginProfit)
    addField(orderMsg, "Droper:", "Preço em BRL: R$" + droperPrice + "\nValor Total: R$" + droperPriceShipping.toFixed(2) + "\nLucro: R$" + lucroDroper)

    if(pixGoatPrice > finalStockPrice){
        // Gera a mensagem para StockX
        messageRef.innerHTML = nomeCliente + ", segue a cotação para encomendar " + sneakerModel + " tamanho " + sneakerSize 
        + "<br><br>TRAZENDO DE FORA<br><br>Parcelado: R$" + roundNum(finalStockPriceParcelado) 
        + "<br>PIX: R$" + roundNum(finalStockPrice) +
        "<br><br>BRASIL<br><br>Parcelado: R$" + roundNum(parceladoDroperPrice) + "<br>PIX: R$" + roundNum(pixDroperPrice)
        stockRef.style.border = "solid green 0.15rem"
        goatRef.style.border = "none"

        addField(orderMsg, ":white_check_mark: StockX:", "Preço em USD: $" + stockPrice + "\nValor Total: R$" + brStockPrice.toFixed(2) + "\nLucro: R$" + lucroStock)
        addField(orderMsg, "Goat:", "Preço em USD: $" + goatPrice + "\nValor Total: R$" + brGoatPrice.toFixed(2) + "\nLucro: R$" + lucroGoat) 
    } else {
        // Gera a mensagem para Goat
        messageRef.innerHTML = nomeCliente + ", segue a cotação para encomendar " + sneakerModel + " tamanho " + sneakerSize 
        + "<br><br>TRAZENDO DE FORA<br><br>Parcelado: R$" + roundNum(parceladoGoatPrice) 
        + "<br>PIX: R$" + roundNum(pixGoatPrice) +
        "<br><br>BRASIL<br><br>Parcelado: R$" + roundNum(parceladoDroperPrice) + "<br>PIX: R$" + roundNum(pixDroperPrice)
        goatRef.style.border = "solid green 0.15rem"
        stockRef.style.border = "none"

        addField(orderMsg, "StockX:", "Preço em USD: $" + stockPrice + "\nValor Total: R$" + brStockPrice.toFixed(2) + "\nLucro: R$" + lucroStock)
        addField(orderMsg, ":white_check_mark: Goat:", "Preço em USD: $" + goatPrice + "\nValor Total: R$" + brGoatPrice.toFixed(2) + "\nLucro: R$" + lucroGoat) 
    }

    messageBoxRef.style.display = "flex";
    
    sendWebhook(orderMsg);

})

copyRef.addEventListener("click", () => {
    let copyM = messageRef.innerHTML.replaceAll("<br>", "\n")

    navigator.clipboard.writeText(copyM)
    toast("Mensagem Copiada!")
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
    }, 3000) 
}

function roundNum(x) {
    x.toFixed(1)
    return Math.round(x / 10) * 10;
}

getUSD()
const usdRef = document.getElementById("usd");

setTimeout(() =>{
    const loadingIcon = document.getElementById("loadingIcon");
    loadingIcon.style.display = "none";
    usdRef.innerHTML = "Valor Dolár: <strong style='color: green'>R$" + priceUSD.toFixed(2); 
}, 1000)

function createMsg(){
    return {
        "embeds": [
          {
            "title": ":package: ENCOMENDA COTADA!",
            "color": 2463422,
            "description": "",
            "timestamp": new Date(),
            "thumbnail": {
              "url": "https://marcelominuto.github.io/encomenda-npv/images/logo%20npv%20transparente.png"
            },
            "footer": {
              "text": "NPV Sneakers",
              "icon_url": "https://marcelominuto.github.io/encomenda-npv/images/logo%20npv%20transparente.png"
            },
            "fields": []
          }
        ],
    }
}

function addField(msg, name, value){
    msg.embeds[0].fields.push({
        name, 
        value
    })
}

function sendWebhook(msg){
    fetch(wbhook + "?wait=true", 
    {"method":"POST", "headers": {"content-type": "application/json"},
    "body": JSON.stringify(msg)})
    .then(a=>a.json()).then(console.log)
}
