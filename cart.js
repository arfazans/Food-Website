// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartTotal = 0;

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    
    // Menu filtering functionality
    if (document.querySelector('.filter-btn')) {
        initializeMenuFilters();
    }
});

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showNotification(`${name} added to cart!`);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotalElement) cartTotalElement.textContent = cartTotal;
    
    if (cartItems) {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.name}')" class="remove-item">&times;</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutItems && checkoutTotal) {
        checkoutItems.innerHTML = '';
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checkout-item';
            itemDiv.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            `;
            checkoutItems.appendChild(itemDiv);
        });
        
        checkoutTotal.textContent = cartTotal;
        document.getElementById('checkout-modal').style.display = 'block';
        toggleCart();
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function searchFood() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            showNotification(`Searching for "${searchTerm}"...`);
            // In a real app, this would filter products
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Menu filtering functionality
function initializeMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
        });
    });
}

function filterMenu(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s ease-in';
        } else {
            item.style.display = 'none';
        }
    });
}

// Checkout form submission
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerAddress = document.getElementById('customer-address').value;
            const paymentMethod = document.getElementById('payment-method').value;
            
            // Generate order ID
            const orderId = 'ORD' + Date.now();
            
            // Create invoice
            generateInvoice({
                orderId,
                customerName,
                customerPhone,
                customerAddress,
                paymentMethod,
                items: cart,
                total: cartTotal
            });
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();
            closeCheckout();
            
            showNotification(`Order placed successfully! Order ID: ${orderId}`);
        });
    }
});

function generateInvoice(orderData) {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${orderData.orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                .invoice-table { width: 100%; border-collapse: collapse; }
                .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .invoice-table th { background-color: #f2f2f2; }
                .total-row { font-weight: bold; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="invoice-header">
                <h1>FOOD PLATFORM</h1>
                <h2>Invoice</h2>
                <p>Order ID: ${orderData.orderId}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="invoice-details">
                <h3>Customer Details:</h3>
                <p><strong>Name:</strong> ${orderData.customerName}</p>
                <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                <p><strong>Address:</strong> ${orderData.customerAddress}</p>
                <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${item.price * item.quantity}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3">Total Amount</td>
                        <td>₹${orderData.total}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()">Print Invoice</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

// Scroll animation
window.addEventListener('scroll', function() {
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    const background = document.querySelector('.background');

    if (background && scrollPosition >= viewportHeight * 0.6) {
        background.classList.add('bg-change');
    } else if (background) {
        background.classList.remove('bg-change');
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('checkout-modal');
    if (event.target == modal) {
        closeCheckout();
    }
}