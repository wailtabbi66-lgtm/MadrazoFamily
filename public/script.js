const cart = { Math: 0, Cocaine: 0 };
const price = 600;

let audioContext;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startMusic() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.value = 55;
    gain.gain.value = 0.025;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
  } catch (error) {
    console.log("Audio is not supported");
  }
}

document.getElementById("enterBtn").addEventListener("click", () => {
  startMusic();
  showScreen("products");
});

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

function addProduct(name, inputId) {
  const quantity = Number.parseInt(document.getElementById(inputId).value, 10);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    toast("أدخل كمية من 1 إلى 999");
    return;
  }

  cart[name] += quantity;
  updateCart();
  toast(`تمت إضافة ${quantity} × ${name}`);
}

function updateCart() {
  const count = cart.Math + cart.Cocaine;
  const total = count * price;

  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = total.toLocaleString() + "$";
}

function clearCart() {
  cart.Math = 0;
  cart.Cocaine = 0;
  updateCart();
  toast("تم إفراغ الطلب");
}

function goInfo() {
  if (cart.Math + cart.Cocaine === 0) {
    toast("أضف منتجًا واحدًا على الأقل");
    return;
  }
  showScreen("info");
}

function confirmInfo() {
  const gang = document.getElementById("gang").value.trim();
  const radio = document.getElementById("radio").value.trim();

  if (!gang || !radio) {
    toast("أدخل اسم العصابة وتردد الراديو");
    return;
  }

  document.getElementById("review-gang").textContent = gang;
  document.getElementById("review-radio").textContent = radio;

  let itemsHTML = "";

  for (const name of ["Math", "Cocaine"]) {
    if (cart[name] > 0) {
      const total = cart[name] * price;
      itemsHTML += `<p>${name}: <b>${cart[name]} × ${price}$ = ${total.toLocaleString()}$</b></p>`;
    }
  }

  document.getElementById("review-items").innerHTML = itemsHTML;
  document.getElementById("review-total").textContent =
    ((cart.Math + cart.Cocaine) * price).toLocaleString() + "$";

  showScreen("review");
}

async function sendOrder() {
  const data = {
    gang: document.getElementById("gang").value.trim(),
    radio: document.getElementById("radio").value.trim(),
    location: "Cayo Perico",
    items: [
      {
        name: "Math",
        quantity: cart.Math,
        unitPrice: 600,
        total: cart.Math * 600
      },
      {
        name: "Cocaine",
        quantity: cart.Cocaine,
        unitPrice: 600,
        total: cart.Cocaine * 600
      }
    ].filter(item => item.quantity > 0),
    total: (cart.Math + cart.Cocaine) * 600
  };

  try {
    const response = await fetch("/.netlify/functions/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Order failed");

    toast("تم إرسال الطلب إلى Discord بنجاح");
  } catch (error) {
    toast("تعذر إرسال الطلب. تحقق من إعدادات Netlify.");
  }
}