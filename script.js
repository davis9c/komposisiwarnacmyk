document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                analyzeColorComposition(img);
                document.getElementById('preview').src = e.target.result;
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('loading').style.display = 'none';
            };
            img.src = e.target.result;
            document.getElementById('loading').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function rgbToCmyk(r, g, b) {
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, m, y);
    return [
        ((c - k) / (1 - k)) * 100,
        ((m - k) / (1 - k)) * 100,
        ((y - k) / (1 - k)) * 100,
        k * 100
    ];
}

function analyzeColorComposition(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const pixels = imageData.data;

    let totalC = 0, totalM = 0, totalY = 0, totalK = 0;
    const numPixels = img.width * img.height;

    for (let i = 0; i < pixels.length; i += 4) {
        const [c, m, y, k] = rgbToCmyk(pixels[i], pixels[i + 1], pixels[i + 2]);
        totalC += c;
        totalM += m;
        totalY += y;
        totalK += k;
    }

    const avgC = totalC / numPixels;
    const avgM = totalM / numPixels;
    const avgY = totalY / numPixels;
    const avgK = totalK / numPixels;

    displayPieChart(avgC, avgM, avgY, avgK);
    displayBarChart(avgC, avgM, avgY, avgK);
}

function displayPieChart(c, m, y, k) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cyan', 'Magenta', 'Yellow', 'Black'],
            datasets: [{
                data: [c, m, y, k],
                backgroundColor: ['#00FFFF', '#FF00FF', '#FFFF00', '#000000'],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

function displayBarChart(c, m, y, k) {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cyan', 'Magenta', 'Yellow', 'Black'],
            datasets: [{
                data: [c, m, y, k],
                backgroundColor: ['#00FFFF', '#FF00FF', '#FFFF00', '#000000'],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}
