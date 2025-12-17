class OilCard extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['name', 'boxes', 'labels', 'oil'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || '';
        const boxes = parseInt(this.getAttribute('boxes')) || 0;
        const labels = parseInt(this.getAttribute('labels')) || 0;
        const oil = parseInt(this.getAttribute('oil')) || 0;

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    background: white;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s ease;
                }
                .card:hover {
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .title {
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    font-size: 1.125rem;
                }
                .progress-container {
                    margin-bottom: 0.5rem;
                }
                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    margin-bottom: 0.25rem;
                }
                .progress-bar {
                    height: 0.5rem;
                    background-color: #e5e7eb;
                    border-radius: 0.25rem;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .boxes {
                    background-color: #4F46E5;
                }
                .labels {
                    background-color: #10B981;
                }
                .oil {
                    background-color: #F59E0B;
                }
            </style>
            <div class="card">
                <div class="title">${name}</div>
                <div class="progress-container">
                    <div class="progress-info">
                        <span>Коробки: ${boxes}</span>
                        <span>${Math.round((boxes / 500) * 100)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill boxes" style="width: ${Math.min(100, (boxes / 500) * 100)}%"></div>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-info">
                        <span>Этикетки: ${labels}</span>
                        <span>${Math.round((labels / 500) * 100)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill labels" style="width: ${Math.min(100, (labels / 500) * 100)}%"></div>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-info">
                        <span>Масло: ${oil} мл</span>
                        <span>${Math.round((oil / 2000) * 100)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill oil" style="width: ${Math.min(100, (oil / 2000) * 100)}%"></div>
</div>
                </div>
            </div>
        `;
    }
}
customElements.define('oil-card', OilCard);