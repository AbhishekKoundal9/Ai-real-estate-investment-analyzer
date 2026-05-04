let probChartInst, featChartInst, trendChartInst, donutChartInst;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dashboard-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    const recResultsContainer = document.getElementById('rec-results-container');
    const recCardsWrapper = document.getElementById('rec-cards-wrapper');

    const resPrice = document.getElementById('res-price');
    const resRoi = document.getElementById('res-roi');
    const resYield = document.getElementById('res-yield');
    const resRisk = document.getElementById('res-risk');
    
    const scoreTextDisplay = document.getElementById('score-text-display');
    const scoreProgressBar = document.getElementById('score-progress-bar');
    const riskInsightText = document.getElementById('risk-insight-text');
    
    const locationSelect = document.getElementById('location');

    // Fetch locations on load
    fetch('http://127.0.0.1:8000/api/locations')
        .then(res => res.json())
        .then(locations => {
            locationSelect.innerHTML = '<option value="" disabled selected>Select Location...</option>';
            locations.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc;
                opt.textContent = loc;
                locationSelect.appendChild(opt);
            });
        })
        .catch(err => console.error('Failed to load locations', err));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const location = document.getElementById('location').value;
        const area = parseFloat(document.getElementById('area').value);
        const bhk = parseInt(document.getElementById('bhk').value);
        const initial_price = parseFloat(document.getElementById('price').value);
        const monthly_rent = parseFloat(document.getElementById('rent').value);

        recResultsContainer.classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
        
        btnText.textContent = 'Processing...';
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // 1. Analyze Investment
            const analyzeRes = await fetch('http://127.0.0.1:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, area, bhk, initial_price, monthly_rent })
            });

            if (!analyzeRes.ok) throw new Error(`Analyze Server Error: ${analyzeRes.status}`);
            const analyzeData = await analyzeRes.json();
            displayAnalysis(analyzeData);

            // 2. Get Recommendations
            const recRes = await fetch('http://127.0.0.1:8000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, max_budget: initial_price, bhk })
            });

            if (!recRes.ok) throw new Error(`Recommend Server Error: ${recRes.status}`);
            const recData = await recRes.json();
            displayRecommendations(recData.recommendations);

        } catch (error) {
            console.error('Error:', error);
            document.getElementById('error-text').textContent = `Failed to connect. Please ensure the server is running. (${error.message})`;
            document.getElementById('error-message').classList.remove('hidden');
        } finally {
            btnText.textContent = 'Analyze & Recommend';
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function displayAnalysis(data) {
        // Update metric cards
        resPrice.textContent = `₹${data.predicted_price} L`;
        resRoi.textContent = `${data.roi}%`;
        resYield.textContent = `${data.rental_yield}%`;
        resRisk.textContent = data.risk_level;
        
        // Update Risk Indicator (Progress Bar)
        const score = data.investment_score;
        scoreTextDisplay.textContent = `${score}/100`;
        scoreProgressBar.style.width = `${score}%`;
        
        if (score >= 70) {
            scoreProgressBar.style.backgroundColor = 'var(--accent-green)';
            riskInsightText.textContent = "Excellent investment. High yield and strong ROI expected.";
        } else if (score >= 40) {
            scoreProgressBar.style.backgroundColor = 'var(--accent-yellow)';
            riskInsightText.textContent = "Moderate investment. Watch market conditions closely.";
        } else {
            scoreProgressBar.style.backgroundColor = 'var(--accent-red)';
            riskInsightText.textContent = "High risk. Yields or ROI fall below standard benchmarks.";
        }
        
        // Render Charts
        renderCharts(data);
    }

    function renderCharts(data) {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', sans-serif";

        // 1. Probability Breakdown (Horizontal Bar)
        const probCtx = document.getElementById('probabilityChart').getContext('2d');
        if (probChartInst) probChartInst.destroy();
        probChartInst = new Chart(probCtx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium-High', 'Average', 'Below Average', 'Low'],
                datasets: [{
                    label: 'Probability %',
                    data: data.probability_breakdown.map(v => v * 100),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                    barThickness: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, max: 100 },
                    y: { grid: { display: false } }
                }
            }
        });

        // 2. Feature Importance (Vertical Bar)
        const featCtx = document.getElementById('featureChart').getContext('2d');
        if (featChartInst) featChartInst.destroy();
        featChartInst = new Chart(featCtx, {
            type: 'bar',
            data: {
                labels: ['Location', 'Area', 'BHK', 'Condition'],
                datasets: [{
                    label: 'Impact',
                    data: data.feature_importances.map(v => v * 100),
                    backgroundColor: ['#3b82f6', '#a855f7', '#10b981', '#f59e0b'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });

        // 3. Price Trend (Line)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        if (trendChartInst) trendChartInst.destroy();
        trendChartInst = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                datasets: [{
                    label: 'Predicted Value (Lakhs)',
                    data: data.trend_data,
                    borderColor: '#10b981',
                    tension: 0.4,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 4. Market Comparison (Mock Data for visual representation)
        const marketCtx = document.getElementById('marketChart').getContext('2d');
        if (donutChartInst) donutChartInst.destroy(); // Reuse donut variable for market chart
        donutChartInst = new Chart(marketCtx, {
            type: 'bar',
            data: {
                labels: ['Your Property', 'Market Avg', 'Top 10%'],
                datasets: [{
                    label: 'Price (Lakhs)',
                    data: [data.predicted_price, data.predicted_price * 0.9, data.predicted_price * 1.2],
                    backgroundColor: ['#a855f7', '#3b82f6', '#10b981'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 5. Investment Distribution (Donut)
        const donutCtx = document.getElementById('donutChart').getContext('2d');
        // Let's create a dedicated variable for this
        if (window.distChartInst) window.distChartInst.destroy();
        window.distChartInst = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Expected ROI', 'Risk Factor', 'Liquidity Score'],
                datasets: [{
                    data: [Math.max(10, data.roi), 100 - data.investment_score, data.investment_score * 0.5],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
                }
            }
        });
    }

    function displayRecommendations(recs) {
        recCardsWrapper.innerHTML = '';
        
        if (!recs || recs.length === 0) {
            recCardsWrapper.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No properties found.</p>';
        } else {
            recs.forEach(rec => {
                const card = document.createElement('div');
                card.className = 'rec-card fade-in';
                card.innerHTML = `
                    <div class="rec-header">
                        <span class="rec-badge">Score: ${(rec.value_score * 100).toFixed(0)}</span>
                        <span class="rec-price">₹${rec.predicted_price.toFixed(2)} L</span>
                    </div>
                    <div class="rec-details">
                        <div>📍 ${rec.location}</div>
                        <div>📏 Area: ${rec.area} sq ft</div>
                        <div>🛏️ BHK: ${rec.bhk}</div>
                    </div>
                `;
                recCardsWrapper.appendChild(card);
            });
        }
        recResultsContainer.classList.remove('hidden');
    }
});
