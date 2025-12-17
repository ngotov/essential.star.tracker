class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                nav {
                    background-color: #4F46E5;
                    color: white;
                    padding: 1rem 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                }
                .logo-icon {
                    margin-right: 0.5rem;
                }
                @media (max-width: 640px) {
                    nav {
                        padding: 0.75rem 1rem;
                    }
                    .logo {
                        font-size: 1.25rem;
                    }
                }
            </style>
            <nav>
                <div class="container">
                    <div class="logo">
                        <i data-feather="activity" class="logo-icon"></i>
                        Essential Star
                    </div>
                </div>
            </nav>
        `;
    }
}
customElements.define('custom-navbar', CustomNavbar);