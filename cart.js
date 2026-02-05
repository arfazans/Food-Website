document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Add to cart functionality
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            const priceStr = menuItem.querySelector('.menu-item-price').textContent;
            const price = parseInt(priceStr.replace('Rs. ', ''));
            const image = menuItem.querySelector('img').src;

            addItemToCart(name, price, image);

            // Visual feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.style.background = '#27ae60';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#00bab1';
            }, 1000);
        });
    });

    // Cart modal functionality
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');

    if (cartButton) {
        cartButton.addEventListener('click', () => {
            renderCart();
            cartModal.style.display = 'flex';
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    function addItemToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        saveCart();
        updateCartCount();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function renderCart() {
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotal = document.getElementById('cart-total');

        if (!cartItemsList) return;

        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align:center; padding: 20px;">Your cart is empty.</p>';
            cartTotal.textContent = 'Total: Rs. 0';
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Rs. ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(itemElement);
        });

        cartTotal.textContent = `Total: Rs. ${total}`;

        // Add events to plus/minus buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                cart[index].quantity += 1;
                saveCart();
                updateCartCount();
                renderCart();
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                saveCart();
                updateCartCount();
                renderCart();
            });
        });

        // Checkout simulation
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                alert('Thank you for your order! Your food is being prepared.');
                cart = [];
                saveCart();
                updateCartCount();
                renderCart();
                document.getElementById('cart-modal').style.display = 'none';
            });
        }
    }
});
