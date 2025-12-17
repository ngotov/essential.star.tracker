class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                footer {
                    background-color: #4F46E5;
                    color: white;
                    padding: 1.5rem 2rem;
                    margin-top: 2rem;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    text-align: center;
                }
                .copyright {
                    font-size: 0.875rem;
                }
            </style>
            <footer>
                <div class="container">
                    <div class="copyright">
                        &copy; ${new Date().getFullYear()} Essential Star Production Tracker
                    </div>
                </div>
            </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);