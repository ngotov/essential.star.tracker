class SuppliesCard extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['lids', 'bottles', 'manuals'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const lids = parseInt(this.getAttribute('lids')) || 0;
        const bottles = parseInt(this.getAttribute('bottles')) || 0;
        const manuals = parseInt(this.getAttribute('manuals')) || 0;

        this.shadowRoot.innerHTML = `
            <style>
                .supply-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    background-color: #f9fafb;
                    margin-bottom: 0.75rem;
                }
                .icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }
                .lids {
                    background-color: #E0E7FF;
                    color: #4F46E5;
                }
                .bottles {
                    background-color: #D1FAE5;
                    color: #10B981;
                }
                .manuals {
                    background-color: #FEF3C7;
                    color: #F59E0B;
                }
                .info {
                    flex-grow: 1;
                }
                .name {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }
                .count {
                    font-size: 0.875rem;
                    color: #6B7280;
                }
                .progress-bar {
                    height: 0.5rem;
                    background-color: #e5e7eb;
                    border-radius: 0.25rem;
                    overflow: hidden;
                    margin-top: 0.5rem;
                }
                .progress-fill {
                    height: 100%;
                }
                .lids-fill {
                    background-color: #4F46E5;
                }
                .bottles-fill {
                    background-color: #10B981;
                }
                .manuals-fill {
                    background-color: #F59E0B;
                }
            </style>
            <div class="supply-item">
                <div class="icon lids">
                    <i data-feather="package"></i>
                </div>
                <div class="info">
                    <div class="name">Крышки</div>
                    <div class="count">${lids} шт</div>
                    <div class="progress-bar">
                        <div class="progress-fill lids-fill" style="width: ${Math.min(100, (lids / 5000) * 100)}%"></div>
                    </div>
</div>
            </div>
            <div class="supply-item">
                <div class="icon bottles">
                    <i data-feather="droplet"></i>
                </div>
                <div class="info">
                    <div class="name">Флакончики</div>
                    <div class="count">${bottles} шт</div>
                    <div class="progress-bar">
                        <div class="progress-fill bottles-fill" style="width: ${Math.min(100, (bottles / 5000) * 100)}%"></div>
                    </div>
</div>
            </div>
            <div class="supply-item">
                <div class="icon manuals">
                    <i data-feather="file-text"></i>
                </div>
                <div class="info">
                    <div class="name">Инструкции</div>
                    <div class="count">${manuals} шт</div>
                    <div class="progress-bar">
                        <div class="progress-fill manuals-fill" style="width: ${Math.min(100, (manuals / 5000) * 100)}%"></div>
                    </div>
</div>
            </div>
        `;
        
        // Initialize feather icons
        if (window.feather) {
            window.feather.replace();
        }
    }
}
customElements.define('custom-supplies-card', SuppliesCard);