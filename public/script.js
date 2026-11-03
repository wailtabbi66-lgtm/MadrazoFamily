const cart = { Math: 0, Cocaine: 0 };
const price = 0;

// الموسيقى موجودة في public/cartel.mp3
const music = new Audio("/cartel.mp3");
music.loop = true;
music.volume = 0.25;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// تُستدعى من زر الدخول في index.html
function enterStore() {
  music.play().catch(() => {
    toast("تعذر تشغيل الموسيقى. اضغط دخول مرة أخرى.");
  });

  showScreen("products");
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

function addProduct(name, inputId) {
  const quantity = Number.parseInt(
    document.getElementById(inputId).value,
    10
  );

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
  document.getElementById("cart-total").textContent =
    total.toLocaleString() + "$";
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
        unitPrice: price,
        total: cart.Math * price
      },
      {
        name: "Cocaine",
        quantity: cart.Cocaine,
        unitPrice: price,
        total: cart.Cocaine * price
      }
    ].filter(item => item.quantity > 0),
    total: (cart.Math + cart.Cocaine) * price
  };

  try {
    const response = await fetch("/.netlify/functions/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Order failed");
    }

    toast("تم إرسال الطلب إلى Discord بنجاح");
  } catch (error) {
    toast("تعذر إرسال الطلب. تحقق من إعدادات Netlify.");
  }
}