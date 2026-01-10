class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .footer {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }
                
                .footer-link {
                    transition: all 0.2s ease;
                }
                
                .footer-link:hover {
                    color: #7dd3fc;
                    transform: translateX(2px);
                }
                
                .social-icon {
                    transition: all 0.2s ease;
                }
                
                .social-icon:hover {
                    transform: translateY(-2px) scale(1.1);
                }
            </style>
            
            <footer class="footer text-gray-300">
                <div class="container mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <!-- Компания -->
                        <div>
                            <div class="flex items-center mb-4">
                                <div class="p-2 bg-primary-500/20 rounded-lg mr-3">
                                    <i data-feather="star" class="w-5 h-5 text-primary-300"></i>
                                </div>
                                <h3 class="text-xl font-bold text-white">Essential Star</h3>
                            </div>
                            <p class="text-sm mb-4">
                                Производственная система для учёта эфирных масел и расходников. 
                                Все данные синхронизируются в реальном времени.
                            </p>
                            <div class="flex items-center text-sm">
                                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span>Система активна</span>
                            </div>
                        </div>
                        
                        <!-- Быстрые ссылки -->
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-4">Быстрые ссылки</h4>
                            <ul class="space-y-2">
                                <li><a href="#" class="footer-link flex items-center">
                                    <i data-feather="chevron-right" class="w-4 h-4 mr-2"></i>
                                    Главная панель
                                </a></li>
                                <li><a href="#" class="footer-link flex items-center">
                                    <i data-feather="chevron-right" class="w-4 h-4 mr-2"></i>
                                    Склад масел
                                </a></li>
                                <li><a href="#" class="footer-link flex items-center">
                                    <i data-feather="chevron-right" class="w-4 h-4 mr-2"></i>
                                    Производство
                                </a></li>
                                <li><a href="#" class="footer-link flex items-center">
                                    <i data-feather="chevron-right" class="w-4 h-4 mr-2"></i>
                                    Отчёты
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Контакты -->
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-4">Контакты</h4>
                            <ul class="space-y-3">
                                <li class="flex items-center">
                                    <i data-feather="phone" class="w-4 h-4 mr-3 text-primary-300"></i>
                                    <span>+7 (999) 123-45-67</span>
                                </li>
                                <li class="flex items-center">
                                    <i data-feather="mail" class="w-4 h-4 mr-3 text-primary-300"></i>
                                    <span>info@essential-star.ru</span>
                                </li>
                                <li class="flex items-center">
                                    <i data-feather="map-pin" class="w-4 h-4 mr-3 text-primary-300"></i>
                                    <span>Москва, Производственная 15</span>
                                </li>
                            </ul>
                        </div>
                        
                        <!-- Социальные сети -->
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-4">Мы в сети</h4>
                            <div class="flex space-x-4 mb-6">
                                <a href="#" class="social-icon p-2 bg-gray-800 rounded-lg hover:bg-primary-600">
                                    <i data-feather="facebook" class="w-5 h-5"></i>
                                </a>
                                <a href="#" class="social-icon p-2 bg-gray-800 rounded-lg hover:bg-primary-600">
                                    <i data-feather="instagram" class="w-5 h-5"></i>
                                </a>
                                <a href="#" class="social-icon p-2 bg-gray-800 rounded-lg hover:bg-primary-600">
                                    <i data-feather="twitter" class="w-5 h-5"></i>
                                </a>
                                <a href="#" class="social-icon p-2 bg-gray-800 rounded-lg hover:bg-primary-600">
                                    <i data-feather="linkedin" class="w-5 h-5"></i>
                                </a>
                            </div>
                            <div class="text-sm">
                                <p>© 2024 Essential Star. Все права защищены.</p>
                                <p class="text-gray-400 mt-1">Версия 2.1.4</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Нижняя часть -->
                    <div class="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
                        <p>Система разработана для внутреннего использования компании Essential Star. Данные обновляются в реальном времени.</p>
                        <p class="mt-2">Последнее обновление: <span id="lastUpdated"></span></p>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        // Инициализация иконок
                        if (typeof feather !== 'undefined') {
                            feather.replace();
                        }
                        
                        // Обновление времени последнего обновления
                        const lastUpdated = this.shadowRoot.getElementById('lastUpdated');
                        if (lastUpdated) {
                            const now = new Date();
                            lastUpdated.textContent = now.toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        }
                    });
                </script>
            </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);
