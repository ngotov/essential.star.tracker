class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .navbar {
                    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .nav-link {
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .nav-link:hover {
                    transform: translateY(-1px);
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background-color: white;
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                @media (max-width: 768px) {
                    .mobile-menu {
                        animation: slideDown 0.3s ease-out;
                    }
                    
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                }
            </style>
            
            <nav class="navbar text-white">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <!-- Логотип и название -->
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-white/20 rounded-lg">
                                <i data-feather="star" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold">Essential Star</h1>
                                <p class="text-sm text-white/80">Производственная система</p>
                            </div>
                        </div>
                        
                        <!-- Десктопное меню -->
                        <div class="hidden md:flex items-center space-x-8">
                            <a href="#" class="nav-link flex items-center">
                                <i data-feather="home" class="mr-2 w-4 h-4"></i>
                                Главная
                            </a>
                            <a href="#" class="nav-link flex items-center">
                                <i data-feather="package" class="mr-2 w-4 h-4"></i>
                                Склад
                            </a>
                            <a href="#" class="nav-link flex items-center">
                                <i data-feather="bar-chart-2" class="mr-2 w-4 h-4"></i>
                                Отчёты
                            </a>
                            <a href="#" class="nav-link flex items-center">
                                <i data-feather="users" class="mr-2 w-4 h-4"></i>
                                Сотрудники
                            </a>
                        </div>
                        
                        <!-- Индикатор обновления -->
                        <div class="hidden md:flex items-center space-x-4">
                            <div class="flex items-center text-sm">
                                <div class="w-2 h-2 bg-green-400 rounded-full mr-2 pulse"></div>
                                <span class="text-white/90">Онлайн</span>
                            </div>
                            <button id="mobileMenuBtn" class="md:hidden">
                                <i data-feather="menu" class="w-6 h-6"></i>
                            </button>
                        </div>
                        
                        <!-- Мобильное меню кнопка -->
                        <button id="mobileMenuBtn" class="md:hidden">
                            <i data-feather="menu" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <!-- Мобильное меню -->
                    <div id="mobileMenu" class="md:hidden mt-4 hidden mobile-menu">
                        <div class="flex flex-col space-y-4 pt-4 border-t border-white/20">
                            <a href="#" class="nav-link flex items-center py-2">
                                <i data-feather="home" class="mr-3 w-5 h-5"></i>
                                Главная
                            </a>
                            <a href="#" class="nav-link flex items-center py-2">
                                <i data-feather="package" class="mr-3 w-5 h-5"></i>
                                Склад
                            </a>
                            <a href="#" class="nav-link flex items-center py-2">
                                <i data-feather="bar-chart-2" class="mr-3 w-5 h-5"></i>
                                Отчёты
                            </a>
                            <a href="#" class="nav-link flex items-center py-2">
                                <i data-feather="users" class="mr-3 w-5 h-5"></i>
                                Сотрудники
                            </a>
                            <div class="pt-4 border-t border-white/20">
                                <div class="flex items-center text-sm">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span class="text-white/90">Система обновлена</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            
            <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    // Инициализация иконок
                    if (typeof feather !== 'undefined') {
                        feather.replace();
                    }
                    
                    // Мобильное меню
                    const mobileMenuBtn = this.shadowRoot.getElementById('mobileMenuBtn');
                    const mobileMenu = this.shadowRoot.getElementById('mobileMenu');
                    
                    if (mobileMenuBtn && mobileMenu) {
                        mobileMenuBtn.addEventListener('click', function() {
                            mobileMenu.classList.toggle('hidden');
                            const icon = mobileMenuBtn.querySelector('i');
                            if (icon) {
                                if (mobileMenu.classList.contains('hidden')) {
                                    icon.setAttribute('data-feather', 'menu');
                                } else {
                                    icon.setAttribute('data-feather', 'x');
                                }
                                feather.replace();
                            }
                        });
                    }
                });
            </script>
        `;
    }
}

customElements.define('custom-navbar', CustomNavbar);