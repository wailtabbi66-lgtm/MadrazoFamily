const cart = {
  Math: 0,
  Cocaine: 0
};

const prices = {
  Math: 0,
  Cocaine: 600
};

// الموسيقى من public/cartel.mp3
const music = document.getElementById("bgMusic");
if (music) {
  music.loop = true;
  music.volume = 0.25;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function enterStore() {
  if (music) {
    music.play().catch(() => {
      toast("اضغط دخول مرة أخرى لتشغيل الموسيقى");
    });
  }

  showScreen("products");
}

function toast(message) {
  const element = document.getElementById("toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

function addProduct(name, inputId) {
  // Math غير متوفر
  if (name === "Math") {
    toast("Math غير متوفر حاليًا");
    return;
  }

  // السماح فقط بالمنتجات المعروفة والمتوفرة
  if (name !== "Cocaine") {
    toast("هذا المنتج غير متوفر");
    return;
  }

  const input = document.getElementById(inputId);
  const quantity = Number.parseInt(input?.value, 10);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    toast("أدخل كمية من 1 إلى 999");
    return;
  }

  cart[name] += quantity;
  updateCart();

  toast(`تمت إضافة ${quantity} × ${name}`);
}

function updateCart() {
  // Math مستبعد لأنه غير متوفر
  const count = cart.Cocaine;
  const total = cart.Cocaine * prices.Cocaine;

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
  if (cart.Cocaine === 0) {
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

  if (cart.Cocaine > 0) {
    const total = cart.Cocaine * prices.Cocaine;

    itemsHTML += `
      <p>
        Cocaine:
        <b>${cart.Cocaine} × ${prices.Cocaine}$ = ${total.toLocaleString()}$</b>
      </p>
    `;
  }

  document.getElementById("review-items").innerHTML = itemsHTML;
  document.getElementById("review-total").textContent =
    (cart.Cocaine * prices.Cocaine).toLocaleString() + "$";

  showScreen("review");
}

async function sendOrder() {
  if (cart.Cocaine === 0) {
    toast("لا يوجد منتج لإرساله");
    return;
  }

  const data = {
    gang: document.getElementById("gang").value.trim(),
    radio: document.getElementById("radio").value.trim(),
    location: "Cayo Perico",
    items: [
      {
        name: "Cocaine",
        quantity: cart.Cocaine,
        unitPrice: prices.Cocaine,
        total: cart.Cocaine * prices.Cocaine
      }
    ],
    total: cart.Cocaine * prices.Cocaine
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
    console.error(error);
  }
}